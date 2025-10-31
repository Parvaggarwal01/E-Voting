from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import io
import json
import os
import requests

app = Flask(__name__)
CORS(app)

# Simple in-memory storage for manifestos
manifestos = {}
processed_chunks = {}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Simple AI Manifesto Service',
        'note': 'Running without ML dependencies for demo'
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

@app.route('/process-manifesto', methods=['POST'])
def process_full_manifesto():
    """Simple manifesto processing without ML"""
    try:
        # This endpoint processes PDFs and stores them simply
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

        # Step 2: Simple text chunking (no ML)
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        chunk_index = 0
        chunk_size = 500  # words per chunk

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

        # Store in memory (for demo)
        manifestos[party_id] = {
            'partyName': party_name,
            'text': text,
            'chunks': chunks,
            'processedAt': str(__import__('datetime').datetime.now())
        }

        return jsonify({
            'success': True,
            'message': f'Successfully processed manifesto for {party_name}',
            'totalChunks': len(chunks),
            'partyId': party_id,
            'partyName': party_name
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search-manifesto', methods=['POST'])
def search_manifesto():
    """Simple text search (no vector search for demo)"""
    try:
        data = request.json
        query = data['query'].lower()
        party_filter = data.get('partyId')

        relevant_chunks = []

        # Simple keyword search across stored manifestos
        for party_id, manifesto_data in manifestos.items():
            if party_filter and party_id != party_filter:
                continue

            for chunk in manifesto_data['chunks']:
                # Simple relevance scoring based on keyword matches
                text_lower = chunk['text'].lower()
                score = 0
                query_words = query.split()

                for word in query_words:
                    if word in text_lower:
                        score += text_lower.count(word)

                if score > 0:
                    relevant_chunks.append({
                        'text': chunk['text'],
                        'metadata': {
                            'partyId': chunk['partyId'],
                            'partyName': chunk['partyName'],
                            'chunkIndex': chunk['chunkIndex']
                        },
                        'similarity': min(score / 10, 1.0)  # Normalize score
                    })

        # Sort by relevance and return top results
        relevant_chunks.sort(key=lambda x: x['similarity'], reverse=True)
        relevant_chunks = relevant_chunks[:5]

        return jsonify({
            'success': True,
            'query': query,
            'relevantChunks': relevant_chunks,
            'totalFound': len(relevant_chunks)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def search_chunks(chunks, query):
    """Simple text-based search for chunks"""
    query_words = query.lower().split()
    scored_chunks = []
    
    for chunk in chunks:
        text = chunk['text'].lower()
        score = 0
        
        # Count word matches
        for word in query_words:
            score += text.count(word)
        
        # Bonus for exact phrase matches
        if query.lower() in text:
            score += 5
            
        if score > 0:
            scored_chunks.append({
                'text': chunk['text'],
                'score': score
            })
    
    return scored_chunks

@app.route('/chat', methods=['POST'])
def chat_with_ollama():
    """Generate response using Ollama LLM"""
    try:
        data = request.json
        query = data.get('message') or data.get('query', '')
        party = data.get('party', 'all')
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'No message provided'
            })
        
        # First, search for relevant chunks
        relevant_chunks = []
        
        if party == 'all':
            # Search across all parties
            for party_id, party_data in manifestos.items():
                chunks = search_chunks(party_data['chunks'], query)
                for chunk in chunks:
                    relevant_chunks.append({
                        'text': chunk['text'],
                        'metadata': {'partyName': party_data['partyName']},
                        'score': chunk['score']
                    })
        elif party in manifestos:
            # Search specific party
            chunks = search_chunks(manifestos[party]['chunks'], query)
            for chunk in chunks:
                relevant_chunks.append({
                    'text': chunk['text'],
                    'metadata': {'partyName': manifestos[party]['partyName']},
                    'score': chunk['score']
                })
        
        # Sort by relevance score
        relevant_chunks.sort(key=lambda x: x['score'], reverse=True)

        if not relevant_chunks:
            return jsonify({
                'success': True,
                'response': "I couldn't find specific information about that topic in the available manifestos. Could you try rephrasing your question or ask about a different topic?",
                'sources': [],
                'query': query
            })

        # Build context from relevant chunks
        context = ""
        sources = []

        for chunk in relevant_chunks[:3]:  # Use top 3 most relevant
            context += f"Party: {chunk['metadata']['partyName']}\n"
            context += f"Content: {chunk['text']}\n\n"
            sources.append(f"{chunk['metadata']['partyName']} (Manifesto)")

        # Create prompt for Ollama
        prompt = f"""You are a helpful political information assistant. Answer the user's question based ONLY on the provided manifesto information.

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

        try:
            # Call Ollama API
            ollama_response = requests.post('http://localhost:11434/api/generate',
                json={
                    'model': 'llama3.2:3b',
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
                # Fallback response if Ollama is not available
                fallback_response = f"Based on the manifesto content about '{query}':\n\n"

                for i, chunk in enumerate(relevant_chunks[:2], 1):
                    # Clean up and format the text better
                    clean_text = chunk['text'].replace('CONTENTS', '').replace('TABLE OF', '').strip()

                    # Extract key sentences related to the query
                    sentences = clean_text.split('. ')
                    relevant_sentences = []
                    query_words = query.lower().split()

                    for sentence in sentences:
                        if any(word in sentence.lower() for word in ['health', 'medical', 'hospital', 'policy', 'care'] if 'health' in query.lower()):
                            relevant_sentences.append(sentence.strip())
                        elif any(word in sentence.lower() for word in ['education', 'school', 'student', 'learning'] if 'education' in query.lower()):
                            relevant_sentences.append(sentence.strip())
                        elif len(relevant_sentences) < 2 and len(sentence.strip()) > 20:
                            relevant_sentences.append(sentence.strip())

                    if relevant_sentences:
                        fallback_response += f"**{chunk['metadata']['partyName']} Position:**\n"
                        for sentence in relevant_sentences[:2]:
                            if len(sentence) > 20:
                                fallback_response += f"• {sentence}\n"
                        fallback_response += "\n"
                    else:
                        fallback_response += f"**{chunk['metadata']['partyName']}**: {clean_text[:300]}...\n\n"

                return jsonify({
                    'success': True,
                    'response': fallback_response,
                    'sources': sources,
                    'query': query
                })
        except Exception as e:
            print(f"Ollama error: {e}")
            # Enhanced fallback if Ollama is not available
            fallback_response = f"Regarding '{query}', here's what I found in the manifestos:\n\n"

            for chunk in relevant_chunks[:2]:
                clean_text = chunk['text'].replace('CONTENTS', '').replace('TABLE OF', '').strip()

                # Extract most relevant part
                if len(clean_text) > 500:
                    # Find sentences with policy keywords
                    sentences = clean_text.split('. ')
                    best_sentences = []

                    for sentence in sentences:
                        if any(keyword in sentence.lower() for keyword in ['policy', 'will', 'ensure', 'provide', 'implement', 'strengthen']):
                            best_sentences.append(sentence.strip())
                            if len(best_sentences) >= 2:
                                break

                    if best_sentences:
                        clean_text = '. '.join(best_sentences)
                    else:
                        clean_text = clean_text[:400]

                fallback_response += f"**{chunk['metadata']['partyName']}**: {clean_text}\n\n"

            return jsonify({
                'success': True,
                'response': fallback_response,
                'sources': sources,
                'query': query
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/list-manifestos', methods=['GET'])
def list_manifestos():
    """List all processed manifestos"""
    return jsonify({
        'success': True,
        'manifestos': {
            party_id: {
                'partyName': data['partyName'],
                'totalChunks': len(data['chunks']),
                'processedAt': data['processedAt']
            }
            for party_id, data in manifestos.items()
        }
    })

if __name__ == '__main__':
    print("🚀 Starting Simple AI Manifesto Service...")
    print("📡 Service will run on http://localhost:5001")
    print("💡 Test with: curl http://localhost:5001/health")
    print("🤖 Ollama integration available (fallback if not running)")

    app.run(host='0.0.0.0', port=5001, debug=True)