import React, { useState, useCallback, useContext } from 'react';
import { CloseIcon, LoadingIcon } from '../components/ui/Icons';
import { DataContext } from '../contexts/DataContext';
import { Client, LedgerEntry, Task } from '../types';
import { summarizeClient, suggestTasks, draftEmail, getLedgerInsights } from '../services/geminiService';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

type AiMode = 'summarize' | 'suggest' | 'draft' | 'insights';

export const AiAssistantView: React.FC = () => {
  const { clients, ledger } = useContext(DataContext);

  const [mode, setMode] = useState<AiMode>('summarize');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [draftInput, setDraftInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  
  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setOutput('');
    
    let result: string | Task[] = '';
    
    try {
      switch (mode) {
        case 'summarize':
          const client = clients.find(c => c.id === selectedClientId);
          if (client) result = await summarizeClient(client);
          break;
        case 'suggest':
          const clientForTasks = clients.find(c => c.id === selectedClientId);
          if (clientForTasks) {
            const tasks = await suggestTasks(clientForTasks);
            result = tasks.length > 0
              ? 'Suggested Tasks:\n\n' + tasks.map(t => `- ${t.title} (Due: ${t.dueDate})`).join('\n')
              : 'No task suggestions at this time.';
          }
          break;
        case 'draft':
          if (draftInput) result = await draftEmail(draftInput);
          break;
        case 'insights':
          result = await getLedgerInsights(ledger);
          break;
      }

      if (typeof result === 'string') {
        setOutput(result);
      }
    } catch (err) {
      console.error(err);
      setOutput('An error occurred while communicating with the AI.');
    } finally {
      setIsLoading(false);
    }
  }, [mode, selectedClientId, draftInput, clients, ledger]);

  const renderInputs = () => {
    switch (mode) {
      case 'summarize':
      case 'suggest':
        return (
          <div>
            <label htmlFor="client-select" className="block text-sm font-medium text-text-secondary mb-1">Select Client</label>
            <select
              id="client-select"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-surface border border-gray-300 rounded-md p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </div>
        );
      case 'draft':
        return (
          <div>
            <label htmlFor="draft-input" className="block text-sm font-medium text-text-secondary mb-1">Email Instruction</label>
            <textarea
              id="draft-input"
              rows={3}
              placeholder="e.g., Draft a follow-up to Eleanor about her renewal documents."
              value={draftInput}
              onChange={(e) => setDraftInput(e.target.value)}
              className="w-full bg-surface border border-gray-300 rounded-md p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        );
      case 'insights':
        return <p className="text-sm text-text-secondary">Click "Generate" to get insights from the business ledger.</p>;
      default:
        return null;
    }
  };

  return (
     <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">AI Assistant</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>Controls</CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-4">
                {(['summarize', 'suggest', 'draft', 'insights'] as AiMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setOutput(''); }}
                    className={`px-3 py-1.5 text-sm font-medium capitalize rounded-md transition-colors ${mode === m ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              
              <div className="space-y-4 mb-4">
                {renderInputs()}
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-secondary hover:bg-primary text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:bg-gray-400"
              >
                {isLoading ? LoadingIcon : 'Generate'}
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>AI Response</CardHeader>
                <CardContent className="min-h-[300px]">
                  {isLoading && !output && (
                      <div className="flex items-center justify-center h-full text-text-secondary">
                          Generating response...
                      </div>
                  )}
                  {output && (
                      <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded-md border">{output}</pre>
                  )}
                  {!isLoading && !output && (
                      <div className="flex items-center justify-center h-full text-text-secondary">
                          Output will appear here.
                      </div>
                  )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};
