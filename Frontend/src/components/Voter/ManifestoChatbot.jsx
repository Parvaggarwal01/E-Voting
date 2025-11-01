import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User,
  Loader,
  ArrowLeft,
  Download,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../../services/api";

const ManifestoChatbot = () => {
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingParties, setLoadingParties] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchPartiesWithManifestos();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPartiesWithManifestos = async () => {
    try {
      setLoadingParties(true);
      const response = await api.get("/manifesto/parties-with-manifestos");
      setParties(response.data.parties);
    } catch (error) {
      console.error("❌ Error fetching parties:", error);
    } finally {
      setLoadingParties(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePartySelect = (party) => {
    setSelectedParty(party);
    setMessages([
      {
        id: 1,
        type: "bot",
        content: `## Hello! 👋

I'm your AI assistant for **${party.name}'s manifesto**.

I have access to **${party.manifestoCount} manifesto document(s)** from ${party.name}.

### What you can ask me:
- *Policy details* and specific promises
- *Comparisons* between different policy areas
- *Implementation plans* and timelines
- Any questions about their **vision** and **priorities**

Feel free to ask me anything about their policies, promises, or vision!`,
        timestamp: new Date(),
        party: party,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading || !selectedParty) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const response = await api.post("/manifesto/chat", {
        partyId: selectedParty.id,
        question: userMessage.content,
        conversationHistory,
      });

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.data.response,
        timestamp: new Date(),
        party: response.data.party,
        sources: response.data.sources,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("❌ Chat error:", error);

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: `Sorry, I encountered an error: ${
          error.response?.data?.message || error.message
        }. Please try again.`,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const goBackToPartySelection = () => {
    setSelectedParty(null);
    setMessages([]);
    setInputMessage("");
  };

  if (loadingParties) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-black mb-4" />
          <p className="text-gray-600">Loading available manifestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedParty && (
              <button
                onClick={goBackToPartySelection}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-black">
                {selectedParty
                  ? `Chat with ${selectedParty.name}`
                  : "Manifesto AI Assistant"}
              </h1>
              <p className="text-sm text-gray-600">
                {selectedParty
                  ? `Ask questions about ${selectedParty.name}'s policies and promises`
                  : "Choose a party to start chatting about their manifesto"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-black" />
          </div>
        </div>
      </div>

      {!selectedParty ? (
        // Party Selection Screen
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl w-full mx-auto">
            <div className="text-center mb-8">
              <Bot className="h-16 w-16 mx-auto text-black mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose a Party Manifesto to Chat With
              </h2>
              <p className="text-gray-600">
                Select any political party below to ask questions about their
                policies and promises
              </p>
            </div>

            {parties.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Manifestos Available
                </h3>
                <p className="text-black">
                  Political parties haven't uploaded their manifestos yet.
                  Please check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parties.map((party) => (
                  <div
                    key={party.id}
                    onClick={() => handlePartySelect(party)}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 hover:border-black"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                        {party.symbolUrl ? (
                          <img
                            src={party.symbolUrl}
                            alt={`${party.name} logo`}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {party.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {party.name}
                        </h3>
                        <p className="text-sm text-black">
                          {party.manifestoCount} manifesto
                          {party.manifestoCount !== 1 ? "s" : ""} available
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black hover:text-gray-700 font-medium">
                        Start Chat →
                      </span>
                      <Bot className="h-5 w-5 text-black" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Chat Interface
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl flex space-x-3 ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-black text-white"
                        : message.isError
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.type === "user"
                        ? "bg-black text-white"
                        : message.isError
                        ? "bg-red-50 border border-red-200 text-red-800"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {message.type === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : message.isError ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            // Custom styling for markdown elements
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold mb-1">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="ml-2">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold">{children}</strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({ children }) => (
                              <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-200 pl-3 italic mb-2">
                                {children}
                              </blockquote>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source) => (
                            <div
                              key={source.id}
                              className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1"
                            >
                              <span className="text-gray-700">
                                {source.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-3xl flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin text-gray-600" />
                      <span className="text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask ${selectedParty.name} about their policies...`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="2"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || loading}
                  className="bg-gray-700 text-white p-3 rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManifestoChatbot;
