'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { pollsApi } from '@/lib/api';
import { generateUserId } from '@/lib/utils';
import { PlusCircle, X, ArrowRight, RefreshCw } from 'lucide-react';

interface CreatePollFormProps {
  onClose: () => void;
}

export function CreatePollForm({ onClose }: CreatePollFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 10) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Please enter a poll title');
    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) return setError('Please provide at least 2 options');

    try {
      setLoading(true);
      const userId = generateUserId();

      await pollsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        created_by: userId,
        options: validOptions.map((text) => ({ text: text.trim() })),
      });

      // Reset form
      setTitle('');
      setDescription('');
      setOptions(['', '']);

      onClose(); // close modal or drawer
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white/80">
      {/* ------------------ BACKGROUND LAYERS ------------------ */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-300/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-80 h-80 -bottom-44 -right-44 bg-pink-300/40 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-fuchsia-200/30 rounded-full blur-3xl" />
      </div>
      {/* -------------------------------------------------------- */}

      <div className="px-6 pt-6 pb-4 flex justify-between items-center relative z-10">
        <div>
          <h3 className="text-4xl font-semibold text-gray-900">Create a Poll</h3>
          <p className="mt-1 text-sm text-gray-600">
            Complete the fields below to create your poll
          </p>
        </div>

        {/* Close button */}
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      <CardContent className="p-6 bg-transparent relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------- TITLE ---------- */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Poll Question *
            </Label>
            <Input
              id="title"
              placeholder="e.g. What's your favorite programming language?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              disabled={loading}
              className="rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <p className="text-xs text-gray-400">{title.length}/200 characters</p>
          </div>

          {/* ---------- DESCRIPTION ---------- */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (Optional)
            </Label>
            <Input
              id="description"
              placeholder="Add more context to your poll..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              disabled={loading}
              className="rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* ---------- OPTIONS ---------- */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Options * (minimum 2, maximum 10)
            </Label>

            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <Input
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  maxLength={200}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(idx)}
                    disabled={loading}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg border border-gray-300 hover:border-gray-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                disabled={loading}
                className="w-full rounded-xl border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add another option
              </Button>
            )}
          </div>

          {/* ---------- ERROR ---------- */}
          {error && (
            <div className="rounded-lg bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* ---------- BUTTONS ---------- */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-base font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create Poll
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}