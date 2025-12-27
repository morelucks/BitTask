'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Task, fetchTasks } from '../../../lib/contracts';
import { ArrowLeft, Loader2, Clock, User, DollarSign, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../components/Providers';
import { acceptTask, submitWork, approveWork } from '../../../lib/contractActions';
import { showNotification } from '../../../lib/notifications';

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isConnected, walletInfo } = useAuth();
    const taskId = parseInt(params.id as string);

    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);

    const userAddress = walletInfo?.addresses?.[2]?.address || walletInfo?.addresses?.[0]?.address;

    useEffect(() => {
        async function loadTask() {
            try {
                const tasks = await fetchTasks();
                const foundTask = tasks.find(t => t.id === taskId);
                if (foundTask) {
                    setTask(foundTask);
                } else {
                    setError('Task not found');
                }
            } catch (err) {
                console.error('Failed to load task', err);
                setError('Failed to load task details');
            } finally {
                setIsLoading(false);
            }
        }

        loadTask();
    }, [taskId]);

    const handleAcceptTask = async () => {
        if (!isConnected) {
            showNotification.error('Please connect your wallet first');
            return;
        }

        setIsActionLoading(true);
        try {
            await acceptTask(taskId);
            showNotification.success('Task accepted!', 'You can now start working on it');
            // Refresh task data
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error accepting task:', error);
            showNotification.error('Failed to accept task', 'Please try again');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSubmitWork = async () => {
        if (!isConnected) {
            showNotification.error('Please connect your wallet first');
            return;
        }

        if (!proofFile) {
            showNotification.error('Please upload proof of work');
            return;
        }

        setIsActionLoading(true);
        try {
            // TODO: Upload file to IPFS and get hash
            // For now, use a placeholder hash
            const placeholderHash = 'a'.repeat(64);
            await submitWork(taskId, placeholderHash);
            showNotification.success('Work submitted!', 'Waiting for creator approval');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error submitting work:', error);
            showNotification.error('Failed to submit work', 'Please try again');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleApproveWork = async () => {
        if (!isConnected) {
            showNotification.error('Please connect your wallet first');
            return;
        }

        setIsActionLoading(true);
        try {
            await approveWork(taskId);
            showNotification.success('Work approved!', 'Payment released to worker');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error approving work:', error);
            showNotification.error('Failed to approve work', 'Please try again');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 text-white p-8 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-gray-950 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/marketplace" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Marketplace
                    </Link>
                    <div className="text-center py-24 bg-gray-900 rounded-2xl border border-gray-800">
                        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300">{error || 'Task not found'}</h3>
                    </div>
                </div>
            </div>
        );
    }

    const isExpired = Date.now() > task.deadline * 1000;
    const isCreator = userAddress === task.creator;
    const isWorker = userAddress === task.worker;
    const statusColor = {
        'open': 'bg-green-500/10 text-green-400',
        'in-progress': 'bg-yellow-500/10 text-yellow-400',
        'submitted': 'bg-blue-500/10 text-blue-400',
        'completed': 'bg-purple-500/10 text-purple-400',
    }[task.status] || 'bg-gray-700 text-gray-400';

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Back Button */}
                <Link href="/marketplace" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 w-fit">
                    <ArrowLeft className="h-5 w-5" />
                    Back to Marketplace
                </Link>

                {/* Task Header */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                                    {task.status.toUpperCase()}
                                </span>
                                <span className="text-gray-500 text-sm">ID: #{task.id}</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-2">{task.title}</h1>
                            <p className="text-gray-400 text-lg">{task.description}</p>
                        </div>
                    </div>

                    {/* Task Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-800">
                        {/* Reward */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-lg">
                                <DollarSign className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Reward</p>
                                <p className="text-2xl font-bold text-indigo-400">{task.amount} STX</p>
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Deadline</p>
                                <p className={`text-lg font-semibold ${isExpired ? 'text-red-400' : 'text-white'}`}>
                                    {new Date(task.deadline * 1000).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                {isExpired && <p className="text-red-400 text-sm mt-1">Expired</p>}
                            </div>
                        </div>

                        {/* Creator */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-cyan-500/10 rounded-lg">
                                <User className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Creator</p>
                                <p className="text-sm font-mono text-gray-300 break-all">{task.creator}</p>
                                {isCreator && <span className="text-xs text-cyan-400 mt-1 block">You</span>}
                            </div>
                        </div>

                        {/* Worker (if assigned) */}
                        {task.worker && (
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Assigned Worker</p>
                                    <p className="text-sm font-mono text-gray-300 break-all">{task.worker}</p>
                                    {isWorker && <span className="text-xs text-purple-400 mt-1 block">You</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">
                    <h2 className="text-xl font-bold mb-4">Actions</h2>

                    {!isConnected && (
                        <div className="text-center py-6 bg-gray-800 rounded-lg">
                            <AlertCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                            <p className="text-gray-300">Connect your wallet to interact with tasks</p>
                        </div>
                    )}

                    {isConnected && task.status === 'open' && !isExpired && !task.worker && (
                        <button
                            onClick={handleAcceptTask}
                            disabled={isActionLoading || isCreator}
                            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            {isActionLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                            {isCreator ? 'You created this task' : isActionLoading ? 'Accepting...' : 'Accept Task'}
                        </button>
                    )}

                    {isConnected && task.status === 'in-progress' && isWorker && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Upload Proof of Work
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                    />
                                    {proofFile && <span className="text-green-400 text-sm">✓ {proofFile.name}</span>}
                                </div>
                            </div>
                            <button
                                onClick={handleSubmitWork}
                                disabled={isActionLoading || !proofFile}
                                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {isActionLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                                <Upload className="h-5 w-5" />
                                {isActionLoading ? 'Submitting...' : 'Submit Work'}
                            </button>
                        </div>
                    )}

                    {isConnected && task.status === 'submitted' && isCreator && (
                        <div className="space-y-3">
                            <button
                                onClick={handleApproveWork}
                                disabled={isActionLoading}
                                className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {isActionLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                                {isActionLoading ? 'Approving...' : 'Approve Work'}
                            </button>
                            <button
                                disabled={isActionLoading}
                                className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                            >
                                Reject Work
                            </button>
                        </div>
                    )}

                    {task.status === 'completed' && (
                        <div className="text-center py-6 bg-gray-800 rounded-lg">
                            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                            <p className="text-gray-300">This task has been completed</p>
                        </div>
                    )}

                    {isExpired && task.status === 'open' && (
                        <div className="text-center py-6 bg-gray-800 rounded-lg">
                            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                            <p className="text-gray-300">This task has expired</p>
                        </div>
                    )}
                </div>

                {/* Task Timeline */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold mb-6">Task Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <div>
                                <p className="font-semibold">Created</p>
                                <p className="text-gray-500 text-sm">Task posted on blockchain</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-4 ${task.status !== 'open' ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-3 h-3 rounded-full ${task.status !== 'open' ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                            <div>
                                <p className="font-semibold">In Progress</p>
                                <p className="text-gray-500 text-sm">Worker accepted the task</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-4 ${['submitted', 'completed'].includes(task.status) ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-3 h-3 rounded-full ${['submitted', 'completed'].includes(task.status) ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                            <div>
                                <p className="font-semibold">Submitted</p>
                                <p className="text-gray-500 text-sm">Worker submitted proof of work</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-4 ${task.status === 'completed' ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-purple-400' : 'bg-gray-600'}`}></div>
                            <div>
                                <p className="font-semibold">Completed</p>
                                <p className="text-gray-500 text-sm">Creator approved and funds released</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
