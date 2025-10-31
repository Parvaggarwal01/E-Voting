from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import chromadb
import PyPDF2
import io
import uuid
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize free sentence transformer model
print("🤖 Loading AI models...")
model = SentenceTransformer('all-MiniLM-L6-v2')  # Free, fast, good quality
print("✅ Sentence transformer loaded")

# Initialize ChromaDB (free vector database)
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection("manifestos")
print("✅ ChromaDB initialized")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Manifesto Service',
        'models_loaded': True
    })

@app.route('/extract-pdf', methods=['POST'])
def extract_pdf_text():
    """Extract text from uploaded PDF"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
        text = ""

        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        # Get metadata from form
        party_id = request.form.get('partyId')
        party_name = request.form.get('partyName')

        return jsonify({
            'success': True,
            'text': text,
            'partyId': party_id,
            'partyName': party_name,
            'pageCount': len(pdf_reader.pages)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chunk-text', methods=['POST'])
def chunk_text():
    """Split text into smaller chunks for better processing"""
    try:
        data = request.json
        text = data['text']
        party_id = data['partyId']
        party_name = data['partyName']
        chunk_size = data.get('chunkSize', 500)  # words per chunk

        # Split into sentences first, then group into chunks
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        chunk_index = 0

        for sentence in sentences:
            # Check if adding this sentence would exceed chunk size
            if len((current_chunk + ". " + sentence).split()) > chunk_size and current_chunk:
                # Save current chunk
                chunks.append({
                    'chunkId': f"{party_id}_chunk_{chunk_index}",
                    'partyId': party_id,
                    'partyName': party_name,
                    'text': current_chunk.strip(),
                    'chunkIndex': chunk_index
                })
                chunk_index += 1
                current_chunk = sentence
            else:
                current_chunk = current_chunk + ". " + sentence if current_chunk else sentence

        # Add the last chunk
        if current_chunk:
            chunks.append({
                'chunkId': f"{party_id}_chunk_{chunk_index}",
                'partyId': party_id,
                'partyName': party_name,
                'text': current_chunk.strip(),
                'chunkIndex': chunk_index
            })

        return jsonify({
            'success': True,
            'chunks': chunks,
            'totalChunks': len(chunks)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-embeddings', methods=['POST'])
def generate_embeddings():
    """Generate embeddings for text chunks"""
    try:
        data = request.json
        chunks = data['chunks']

        processed_chunks = []

        for chunk in chunks:
            # Generate embedding
            embedding = model.encode(chunk['text']).tolist()

            processed_chunks.append({
                **chunk,
                'embedding': embedding
            })

        return jsonify({
            'success': True,
            'processedChunks': processed_chunks
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/store-embeddings', methods=['POST'])
def store_embeddings():
    """Store embeddings in ChromaDB"""
    try:
        data = request.json
        chunks = data['processedChunks']

        # Prepare data for ChromaDB
        embeddings = []
        documents = []
        metadatas = []
        ids = []

        for chunk in chunks:
            embeddings.append(chunk['embedding'])
            documents.append(chunk['text'])
            metadatas.append({
                'partyId': chunk['partyId'],
                'partyName': chunk['partyName'],
                'chunkIndex': chunk['chunkIndex']
            })
            ids.append(chunk['chunkId'])

        # Store in ChromaDB
        collection.add(
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

        return jsonify({
            'success': True,
            'storedChunks': len(chunks),
            'message': f'Successfully stored {len(chunks)} chunks for {chunks[0]["partyName"]}'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search-manifesto', methods=['POST'])
def search_manifesto():
    """Search for relevant manifesto content based on query"""
    try:
        data = request.json
        query = data['query']
        party_filter = data.get('partyId')
        top_k = data.get('topK', 5)

        # Generate query embedding
        query_embedding = model.encode(query).tolist()

        # Build where clause for filtering
        where_clause = None
        if party_filter:
            where_clause = {'partyId': party_filter}

        # Search similar documents
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_clause
        )

        # Format results
        relevant_chunks = []
        if results['documents'] and len(results['documents']) > 0:
            for i in range(len(results['documents'][0])):
                relevant_chunks.append({
                    'text': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'similarity': 1 - results['distances'][0][i]  # Convert distance to similarity
                })

        return jsonify({
            'success': True,
            'query': query,
            'relevantChunks': relevant_chunks,
            'totalFound': len(relevant_chunks)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat_with_ollama():
    """Generate response using Ollama LLM"""
    try:
        data = request.json
        query = data['query']
        relevant_chunks = data.get('relevantChunks', [])

        # Build context from relevant chunks
        context = ""
        sources = []

        for chunk in relevant_chunks[:3]:  # Use top 3 most relevant
            context += f"Party: {chunk['metadata']['partyName']}\n"
            context += f"Content: {chunk['text']}\n\n"
            sources.append(f"{chunk['metadata']['partyName']} (Manifesto)")

        # Create prompt for Ollama
        prompt = f"""
You are a helpful political information assistant. Answer the user's question based ONLY on the provided manifesto information.

User Question: {query}

Relevant Manifesto Content:
{context}

Instructions:
1. Answer the question directly based on the manifesto content provided
2. Be factual and cite which party's position you're referencing
3. If the information is insufficient, clearly state what's missing
4. Maintain complete political neutrality
5. Help voters make informed decisions

Answer:"""

        # Call Ollama API
        ollama_response = requests.post('http://localhost:11434/api/generate',
            json={
                'model': 'llama3.2:3b',  # Use the smaller, faster model
                'prompt': prompt,
                'stream': False
            },
            timeout=30
        )

        if ollama_response.status_code == 200:
            response_text = ollama_response.json()['response']

            return jsonify({
                'success': True,
                'response': response_text,
                'sources': sources,
                'query': query
            })
        else:
            return jsonify({'error': 'Ollama service unavailable'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/process-manifesto', methods=['POST'])
def process_full_manifesto():
    """Complete pipeline: PDF -> Text -> Chunks -> Embeddings -> Store"""
    try:
        # This endpoint combines all steps for n8n workflow
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        party_id = request.form.get('partyId')
        party_name = request.form.get('partyName')

        # Step 1: Extract PDF text
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        # Step 2: Chunk text
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        chunk_index = 0
        chunk_size = 500

        for sentence in sentences:
            if len((current_chunk + ". " + sentence).split()) > chunk_size and current_chunk:
                chunks.append({
                    'chunkId': f"{party_id}_chunk_{chunk_index}",
                    'partyId': party_id,
                    'partyName': party_name,
                    'text': current_chunk.strip(),
                    'chunkIndex': chunk_index
                })
                chunk_index += 1
                current_chunk = sentence
            else:
                current_chunk = current_chunk + ". " + sentence if current_chunk else sentence

        if current_chunk:
            chunks.append({
                'chunkId': f"{party_id}_chunk_{chunk_index}",
                'partyId': party_id,
                'partyName': party_name,
                'text': current_chunk.strip(),
                'chunkIndex': chunk_index
            })

        # Step 3: Generate embeddings and store
        embeddings = []
        documents = []
        metadatas = []
        ids = []

        for chunk in chunks:
            embedding = model.encode(chunk['text']).tolist()
            embeddings.append(embedding)
            documents.append(chunk['text'])
            metadatas.append({
                'partyId': chunk['partyId'],
                'partyName': chunk['partyName'],
                'chunkIndex': chunk['chunkIndex']
            })
            ids.append(chunk['chunkId'])

        # Store in ChromaDB
        collection.add(
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

        return jsonify({
            'success': True,
            'message': f'Successfully processed manifesto for {party_name}',
            'totalChunks': len(chunks),
            'partyId': party_id,
            'partyName': party_name
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting AI Manifesto Service...")
    print("📡 Service will run on http://localhost:3001")
    print("🤖 Make sure Ollama is running: ollama serve")
    print("💡 Test with: curl http://localhost:3001/health")

    app.run(host='0.0.0.0', port=3001, debug=True)