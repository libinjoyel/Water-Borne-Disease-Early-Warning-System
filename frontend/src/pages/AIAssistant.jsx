import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, ShieldAlert, Droplets, LoaderCircle, RotateCcw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const starterPrompts = [
  'What should I do if a district has rising diarrhea cases after flooding?',
  'Summarize safe drinking water steps for a rural community.',
  'Explain how to interpret a high risk warning from this system.',
];

const defaultIntro = 'I can help explain water-borne disease risks, symptoms, and response steps. Ask me about a district, symptom pattern, or prevention guidance.';

export default function AIAssistant() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: defaultIntro }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const history = useMemo(
    () => messages.slice(-10).map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', content: message.content })),
    [messages]
  );

  const sendMessage = async (nextMessage) => {
    const messageText = nextMessage.trim();
    if (!messageText || isLoading) return;

    setError('');
    setIsLoading(true);
    setMessages((current) => [...current, { role: 'user', content: messageText }]);
    setInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, history }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI request failed.');
      }

      setMessages((current) => [...current, { role: 'assistant', content: data.reply || 'No response returned.' }]);
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach the AI assistant.');
      setMessages((current) => [...current, { role: 'assistant', content: 'I could not reach the AI service right now. Check the backend key and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: defaultIntro }]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/40 dark:shadow-black/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.04),_transparent_45%)] pointer-events-none" />

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
            <div className="p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800/80 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 text-xs font-bold tracking-widest uppercase">
                <Sparkles className="h-4 w-4" /> AI Assistant
              </div>

              <div className="space-y-3 max-w-xl">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Ask the water-health copilot for practical outbreak guidance.
                </h1>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Use this assistant to interpret risk signals, summarize public health actions, and explain what communities should do next when contamination rises.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                  <ShieldAlert className="h-5 w-5 text-rose-500 mb-3" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Early warning</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Translate signals into action.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                  <Droplets className="h-5 w-5 text-sky-500 mb-3" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Safe water</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Practical treatment steps.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                  <Bot className="h-5 w-5 text-teal-500 mb-3" />
                  <h3 className="font-bold text-slate-900 dark:text-white">AI guidance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Built on Google Gen AI.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Starter prompts</h2>
                  <button
                    type="button"
                    onClick={clearChat}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:border-teal-500/40 hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 lg:p-8 bg-slate-50/80 dark:bg-slate-950/40">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Conversation</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Server-side AI responses through the backend.</p>
                </div>
                {isLoading && (
                  <div className="inline-flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-semibold">
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Thinking
                  </div>
                )}
              </div>

              <div className="h-[520px] flex flex-col rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-inner">
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                      <motion.div
                        key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                            message.role === 'assistant'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                              : 'bg-gradient-to-r from-teal-600 to-sky-500 text-white'
                          }`}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {error && (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                      {error}
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage(input);
                  }}
                  className="border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/60"
                >
                  <div className="flex items-end gap-3">
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      rows={2}
                      placeholder="Ask about symptoms, safe water, flood exposure, or district risk..."
                      className="flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" /> Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}