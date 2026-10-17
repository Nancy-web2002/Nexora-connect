import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { ActionPlanTask } from '../../types';
import {
  Send,
  Sparkles,
  BotMessageSquare,
  User,
  ListTodo,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';

export const AIAssistantScreen: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    isAiTyping,
    opportunities,
    viewOpportunityDetails,
    actionTasks,
    toggleTaskCompleted,
    addTask,
    removeTask,
    userProfile,
  } = useApp();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'plan'>('chat');

  // Task creation state
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTaskTimeline, setNewTaskTimeline] = useState<string>('Week 2');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiTyping) return;
    const msg = inputMessage;
    setInputMessage('');
    await sendChatMessage(msg);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || 'Follow verified institutional portal steps.',
      priority: newTaskPriority,
      timeline: newTaskTimeline,
      category: 'User Custom Milestone',
      completed: false,
    });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAddingTask(false);
  };

  const completedCount = actionTasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / (actionTasks.length || 1)) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            AI Assistant & Action Plan
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Turn evidence discovery into realistic milestones. Ask follow-up questions, verify requirements, and manage tasks.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BotMessageSquare className="w-4 h-4 text-[#3867F6]" />
            <span>AI Advisory Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'plan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4 text-[#3867F6]" />
            <span>Action Plan Board</span>
            <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm tabular-nums">
              {completedCount}/{actionTasks.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: either split or tabbed */}
      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Stream (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[700px] overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3.5 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-[#101828] text-white'
                          : 'bg-[#3867F6] text-white shadow-xs'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs leading-relaxed space-y-3 ${
                        isUser
                          ? 'bg-[#101828] text-white'
                          : 'bg-slate-50 border border-slate-200/90 text-slate-800'
                      }`}
                    >
                      <div className="whitespace-pre-line prose-xs">{msg.content}</div>

                      {/* Embedded Opportunity Recommendations */}
                      {msg.recommendedOpportunityIds && msg.recommendedOpportunityIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Corroborated Opportunities Mentioned:</span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {msg.recommendedOpportunityIds.map((id) => {
                              const opp = opportunities.find((o) => o.id === id);
                              if (!opp) return null;
                              return (
                                <div
                                  key={id}
                                  onClick={() => viewOpportunityDetails(opp.id)}
                                  className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <div className="font-bold text-slate-900 truncate">
                                    {opp.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                                    <span>{opp.provider.slice(0, 20)}...</span>
                                    <StatusBadge status={opp.verificationStatus} size="sm" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Suggested Follow-up Prompts */}
                      {msg.suggestedPrompts && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                          {msg.suggestedPrompts.map((promptText, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => sendChatMessage(promptText)}
                              className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
                            >
                              {promptText}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`text-[10px] ${isUser ? 'text-slate-400' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isAiTyping && (
                <div className="flex items-center gap-3 text-xs text-slate-500 p-2">
                  <div className="w-6 h-6 rounded-full bg-[#3867F6] text-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>Nexora AI Advisor evaluating verified sources...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about scholarship requirements, transition roadmap, or fee red flags..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#3867F6]/20 focus:border-[#3867F6]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isAiTyping}
                className="px-4 py-3 rounded-xl bg-[#3867F6] hover:bg-[#2D55D8] disabled:opacity-50 text-white transition-colors flex items-center justify-center shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Action Plan Snapshot (Right Column) */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#3867F6]" />
                  <span>My Active Action Plan</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {progressPercent}% Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#3867F6] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Mini Task List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {actionTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskCompleted(task.id)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors flex items-start gap-2.5"
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-medium ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {task.timeline} · {task.priority.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('plan')}
                className="w-full py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Manage Full Action Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Verification Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3867F6]" />
                Transparent AI Boundaries
              </div>
              <p className="leading-relaxed">
                Nexora Connect does not manufacture admissions letters or bypass official institutional vetting. All recommendations are designed to help you prepare high-standard submissions.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Full Action Plan Board */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold text-[#3867F6] uppercase tracking-wider">
                Personalized Preparation Roadmap
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Target: {userProfile.primaryGoal}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {completedCount} of {actionTasks.length} milestones completed ({progressPercent}%)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="px-3.5 py-2 text-xs font-semibold bg-[#3867F6] hover:bg-[#2D55D8] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Task</span>
              </button>
            </div>
          </div>

          {/* Add Custom Task Form */}
          {isAddingTask && (
            <form
              onSubmit={handleCreateTask}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="text-xs font-bold text-slate-900">Create New Milestone</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Task title (e.g. Request academic transcript)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                  required
                />
                <input
                  type="text"
                  placeholder="Timeline (e.g. Week 3, By Nov 15)..."
                  value={newTaskTimeline}
                  onChange={(e) => setNewTaskTimeline(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                />
              </div>
              <textarea
                placeholder="Description / requirements..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                rows={2}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 font-medium">Priority:</span>
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase ${
                        newTaskPriority === p
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-[#3867F6] text-white rounded-lg"
                  >
                    Save Milestone
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Action Tasks List */}
          <div className="space-y-3">
            {actionTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  task.completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleTaskCompleted(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 font-mono text-[11px] tabular-nums">
                        {task.timeline}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-rose-50 text-rose-700'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {task.description}
                    </p>

                    {task.sourceName && task.sourceUrl && (
                      <div className="pt-1 flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400">Reference:</span>
                        <a
                          href={task.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3867F6] hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>{task.sourceName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => removeTask(task.id)}
                    aria-label="Remove task"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
