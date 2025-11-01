from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ollama configuration
OLLAMA_URL = "http://localhost:11434"
MODEL_NAME = "llama3.2:3b"  # or your preferred model

def call_ollama(prompt, context=""):
    """Call Ollama API with context-aware prompting"""
    try:
        full_prompt = f"""Context: {context}

Question: {prompt}

Please provide a detailed, accurate answer based only on the provided context. Use markdown formatting in your response:
- Use **bold** for important points
- Use *italic* for emphasis
- Use bullet points (- or *) for lists
- Use numbered lists (1. 2. 3.) when appropriate
- Use ## for section headers if needed
- Use `code` for technical terms or specific names
- If information is not in the context, clearly state that.

Format your response in clean, readable markdown."""

        payload = {
            "model": MODEL_NAME,
            "prompt": full_prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9,
                "max_tokens": 1000
            }
        }

        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=payload
        )

        if response.status_code == 200:
            return response.json().get("response", "").strip()
        else:
            logger.error(f"Ollama API error: {response.status_code}")
            return "I'm having trouble processing your request right now. Please try again."

    except requests.exceptions.ConnectionError:
        logger.error("Cannot connect to Ollama service")
        return "AI service is currently unavailable. Please make sure Ollama is running."
    except Exception as e:
        logger.error(f"Error calling Ollama: {str(e)}")
        return "An error occurred while processing your request."

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test Ollama connection
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        ollama_status = "connected" if response.status_code == 200 else "disconnected"
    except:
        ollama_status = "disconnected"

    return jsonify({
        "status": "healthy",
        "ollama": ollama_status,
        "model": MODEL_NAME
    })

@app.route('/chat/manifesto', methods=['POST'])
def chat_with_manifesto():
    """Chat with party manifesto using AI"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        question = data.get('question', '').strip()
        manifesto_content = data.get('manifesto_content', '')
        party_name = data.get('party_name', 'the party')
        conversation_history = data.get('conversation_history', [])

        if not question:
            return jsonify({"error": "Question is required"}), 400

        if not manifesto_content:
            return jsonify({
                "response": f"I don't have access to {party_name}'s manifesto content. Please ask the party to upload their manifesto first.",
                "sources": []
            })

        logger.info(f"Processing question for {party_name}: {question[:50]}...")

        # Build conversation context
        context_history = ""
        if conversation_history:
            recent_history = conversation_history[-4:]  # Last 4 exchanges
            context_history = "\n".join([
                f"{'Human' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
                for msg in recent_history
            ])

        # Create enhanced prompt with manifesto context
        enhanced_prompt = f"""You are an AI assistant helping voters understand {party_name}'s political manifesto and policies.

PARTY: {party_name}

MANIFESTO CONTENT:
{manifesto_content}

RECENT CONVERSATION:
{context_history}

CURRENT QUESTION: {question}

INSTRUCTIONS:
1. Answer based ONLY on the provided manifesto content
2. Be specific and quote relevant sections when possible
3. If the question isn't covered in the manifesto, clearly state that
4. Maintain a neutral, informative tone
5. Focus on {party_name}'s policies and promises
6. If asked about other parties, redirect to focus on {party_name}
7. Provide factual information without bias

Please answer the voter's question about {party_name}'s manifesto:"""

        # Get AI response
        ai_response = call_ollama(enhanced_prompt)

        logger.info(f"Generated response for {party_name} (length: {len(ai_response)})")

        return jsonify({
            "response": ai_response,
            "party_name": party_name,
            "model": MODEL_NAME,
            "timestamp": "2024-11-01T00:00:00Z"
        })

    except Exception as e:
        logger.error(f"Error in manifesto chat: {str(e)}")
        return jsonify({
            "error": "Failed to process your question",
            "details": str(e)
        }), 500

@app.route('/analyze/manifesto', methods=['POST'])
def analyze_manifesto():
    """Analyze and extract key points from manifesto"""
    try:
        data = request.get_json()
        manifesto_text = data.get('manifesto_text', '')
        party_name = data.get('party_name', 'Unknown Party')

        if not manifesto_text:
            return jsonify({"error": "Manifesto text is required"}), 400

        analysis_prompt = f"""Analyze the following political manifesto for {party_name} and extract:

1. Key policy areas and promises
2. Economic policies
3. Social policies
4. Infrastructure plans
5. Education and healthcare initiatives
6. Environmental policies
7. Main slogans or themes

MANIFESTO TEXT:
{manifesto_text}

Please provide a structured analysis in JSON format with clear categories and key points."""

        analysis = call_ollama(analysis_prompt)

        return jsonify({
            "analysis": analysis,
            "party_name": party_name,
            "text_length": len(manifesto_text),
            "processed_at": "2024-11-01T00:00:00Z"
        })

    except Exception as e:
        logger.error(f"Error analyzing manifesto: {str(e)}")
        return jsonify({"error": "Failed to analyze manifesto"}), 500

@app.route('/compare/manifestos', methods=['POST'])
def compare_manifestos():
    """Compare manifestos between parties"""
    try:
        data = request.get_json()
        party_manifestos = data.get('manifestos', {})  # {party_name: manifesto_text}
        comparison_topic = data.get('topic', 'general policies')

        if len(party_manifestos) < 2:
            return jsonify({"error": "At least 2 party manifestos required for comparison"}), 400

        # Build comparison prompt
        manifesto_sections = []
        for party, content in party_manifestos.items():
            manifesto_sections.append(f"=== {party} MANIFESTO ===\n{content}\n")

        comparison_prompt = f"""Compare the following political party manifestos on the topic of "{comparison_topic}":

{chr(10).join(manifesto_sections)}

Please provide a detailed comparison highlighting:
1. Similarities between parties
2. Key differences in approach
3. Specific promises or policies for each party
4. Which party has more detailed plans on this topic

Be neutral and factual in your comparison."""

        comparison = call_ollama(comparison_prompt)

        return jsonify({
            "comparison": comparison,
            "topic": comparison_topic,
            "parties_compared": list(party_manifestos.keys()),
            "compared_at": "2024-11-01T00:00:00Z"
        })

    except Exception as e:
        logger.error(f"Error comparing manifestos: {str(e)}")
        return jsonify({"error": "Failed to compare manifestos"}), 500

if __name__ == '__main__':
    print("🤖 Starting Manifesto AI Service...")
    print(f"📋 Using model: {MODEL_NAME}")
    print(f"🔗 Ollama URL: {OLLAMA_URL}")
    app.run(host='0.0.0.0', port=5001, debug=True)