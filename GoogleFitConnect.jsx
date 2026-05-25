import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    isGoogleFitConnected,
    getGoogleFitFlag,
    connectGoogleFit,
    disconnectGoogleFit,
    getTodayFitnessData,
    stepsToActivityLevel,
} from '../services/googleFitService';
import { ACTIVITY_LABELS } from '../models/User';

const GoogleLogo = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

const CLIENT_ID_PLACEHOLDER = 'your_client_id_here.apps.googleusercontent.com';
const isConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== CLIENT_ID_PLACEHOLDER;

export default function GoogleFitConnect({ userId, staticTdee, onCaloriesChange, onFitnessChange }) {
    const [connected, setConnected]   = useState(false);
    const [reconnect, setReconnect]   = useState(false);
    const [loading, setLoading]       = useState(false);
    const [fetching, setFetching]     = useState(false);
    const [calories, setCalories]     = useState(null);
    const [steps, setSteps]           = useState(null);
    const [connectError, setConnectError] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const tokenPresent = isGoogleFitConnected();
        if (tokenPresent) {
            setConnected(true);
            fetchCalories();
        } else {
            // Check DB flag to know if they were previously connected
            getGoogleFitFlag(userId).then(flag => {
                if (flag) setReconnect(true);
            });
        }
    }, [userId]);

    async function fetchCalories() {
        setFetching(true);
        const data = await getTodayFitnessData();
        const cal = data?.calories ?? null;
        const stp = data?.steps    ?? null;
        setCalories(cal);
        setSteps(stp);
        onCaloriesChange?.(cal);
        onFitnessChange?.({ calories: cal, steps: stp, activityLevel: stepsToActivityLevel(stp) });
        setFetching(false);
    }

    async function handleConnect() {
        setConnectError(null);
        setLoading(true);
        const result = await connectGoogleFit(userId);
        if (result.success) {
            setConnected(true);
            setReconnect(false);
            await fetchCalories();
        } else {
            const msg = result.error || 'Failed to connect Google Fit.';
            setConnectError(msg);
            toast.error(msg, { duration: 5000 });
        }
        setLoading(false);
    }

    async function handleDisconnect() {
        setLoading(true);
        await disconnectGoogleFit(userId);
        setConnected(false);
        setReconnect(false);
        setCalories(null);
        setSteps(null);
        onCaloriesChange?.(null);
        onFitnessChange?.(null);
        setLoading(false);
    }

    // Not connected and no prior intent
    if (!connected && !reconnect) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-orange rounded-lg p-4"
            >
                <div className="flex items-center gap-2 mb-2">
                    <GoogleLogo />
                    <p className="text-sm font-semibold text-white">Google Fit</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                    Connect to sync real calorie burn and get more accurate meal plans.
                </p>

                {!isConfigured ? (
                    <div className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded p-2">
                        <p className="font-semibold mb-0.5">Client ID not configured</p>
                        <p>Add your <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to <code className="font-mono">.env</code> and restart the dev server.</p>
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handleConnect}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <GoogleLogo />
                            )}
                            {loading ? 'Connecting…' : 'Connect Google Fit'}
                        </button>
                        {connectError && (
                            <p className="mt-2 text-xs text-red-400">{connectError}</p>
                        )}
                    </>
                )}
            </motion.div>
        );
    }

    // Previously connected but token expired (new session)
    if (reconnect && !connected) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-orange rounded-lg p-4"
            >
                <div className="flex items-center gap-2 mb-2">
                    <GoogleLogo />
                    <p className="text-sm font-semibold text-white">Google Fit</p>
                    <span className="ml-auto text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Session expired</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                    Reconnect to use real calorie data. Using estimated TDEE for now.
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleConnect}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-all disabled:opacity-50"
                    >
                        {loading
                            ? <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            : <GoogleLogo />
                        }
                        {loading ? 'Connecting…' : 'Reconnect'}
                    </button>
                    <button
                        type="button"
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="px-3 py-2 rounded-lg text-gray-500 text-xs hover:text-gray-300 transition-all"
                    >
                        Disconnect
                    </button>
                </div>
                {connectError && (
                    <p className="mt-2 text-xs text-red-400">{connectError}</p>
                )}
            </motion.div>
        );
    }

    // Connected — loading calories
    if (connected && fetching) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-orange rounded-lg p-4"
            >
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Fetching today's data from Google Fit…</p>
                </div>
            </motion.div>
        );
    }

    // Connected — no data synced today
    if (connected && !fetching && calories === null && steps === null) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-orange rounded-lg p-4"
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                    <p className="text-sm font-semibold text-white">Google Fit Connected</p>
                </div>
                <p className="text-xs text-gray-400 mb-1">
                    No activity data found for today.
                </p>
                <p className="text-xs text-gray-500 mb-3">
                    Make sure the Google Fit app is installed and synced on your Android phone, or that a fitness tracker is linked to this Google account.
                </p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={fetchCalories}
                        className="text-xs text-primary hover:text-primary/80 transition-all"
                    >
                        Retry
                    </button>
                    <button
                        type="button"
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="text-xs text-gray-500 hover:text-gray-300 transition-all"
                    >
                        Disconnect
                    </button>
                </div>
            </motion.div>
        );
    }

    // Connected — data available (at least calories or steps)
    const diff = staticTdee > 0 && calories ? calories - staticTdee : null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-orange rounded-lg p-4"
        >
            <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <p className="text-sm font-semibold text-white">Google Fit Connected</p>
            </div>

            <div className="space-y-2">
                {calories != null && (
                    <div className="flex items-baseline justify-between">
                        <p className="text-xs text-gray-400">Calories burned today</p>
                        <p className="text-lg font-bold text-primary">{calories.toLocaleString()} kcal</p>
                    </div>
                )}
                {steps != null && (
                    <div className="flex items-baseline justify-between">
                        <p className="text-xs text-gray-400">Steps today</p>
                        <p className="text-base font-semibold text-white">{steps.toLocaleString()} steps</p>
                    </div>
                )}
                {steps != null && stepsToActivityLevel(steps) && (
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">Activity level (from steps)</p>
                        <p className="text-xs font-semibold text-primary capitalize">
                            {(ACTIVITY_LABELS[stepsToActivityLevel(steps)] ?? '').split('(')[0].trim()}
                        </p>
                    </div>
                )}
                {diff !== null && (
                    <div className="flex items-baseline justify-between">
                        <p className="text-xs text-gray-400">vs. estimated TDEE</p>
                        <p className={`text-xs font-medium ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {diff > 0 ? `+${diff}` : diff} kcal
                        </p>
                    </div>
                )}
                {calories != null && (
                    <p className="text-xs text-green-400/80 bg-green-400/10 rounded px-2 py-1">
                        Meal plan targets adjusted to real burn
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-all"
            >
                {loading ? 'Disconnecting…' : 'Disconnect'}
            </button>
        </motion.div>
    );
}
