const { v4: uuidv4 } = require('uuid');

class MultiObjectiveOptimizer {
    constructor(treatments, severity = 0.5) {
        this.treatments = (treatments || []).map(t => ({
            ...t,
            id: t.id || t.name || uuidv4(),
            effectiveness: this.normalize(t.effectiveness, 0.5),
            cost: this.normalize(t.cost, 0.5),
            side_effects: this.normalize(t.side_effects, 0.1),
            prevention_value: this.normalize(t.prevention_value, 0.0)
        }));
        this.severity = Number(severity) || 0.5;
    }

    normalize(val, defaultVal) {
        const num = Number(val);
        return isNaN(num) ? defaultVal : Math.max(0, Math.min(1, num));
    }

    // Fuzzy Membership Functions
    fuzzyHigh(val) {
        // Sigmoid curve favoring higher values
        return 1 / (1 + Math.exp(-10 * (val - 0.5)));
    }

    fuzzyLow(val) {
        // Sigmoid curve favoring lower values
        return 1 / (1 + Math.exp(10 * (val - 0.5)));
    }

    optimize(strategy = 'balanced') {
        // 1. Score each treatment using strategy-specific fuzzy logic
        const scoredTreatments = this.treatments.map(t => {
            const score = this.calculateFuzzyScore(t, strategy);
            return { ...t, score };
        });

        // 2. Sort by score descending
        scoredTreatments.sort((a, b) => b.score - a.score);

        // 3. Select top treatments
        const selected = this.selectTreatments(scoredTreatments, strategy);

        return {
            strategy,
            treatments: selected.map(t => t.id),
            details: selected,
            metrics: this.calculateMetrics(selected)
        };
    }

    calculateFuzzyScore(t, strategy) {
        let score = 0;

        // Effectiveness Score (Higher is better)
        const effScore = t.effectiveness;
        // Cost Score (Lower is better, so 1 - cost)
        const costScore = 1 - t.cost;
        // Safety Score (Lower side effects is better)
        const safetyScore = 1 - t.side_effects;

        switch (strategy) {
            case 'high_effectiveness':
                // Prioritize Effectiveness heavily (Power 0.5 boosts comparisons)
                // Rule: If Effectiveness is High THEN Score is High
                score = (Math.pow(effScore, 0.5) * 0.7) +
                    (costScore * 0.2) +
                    (safetyScore * 0.1);

                // Boost based on severity
                if (this.severity > 0.7) score += 0.2;
                break;

            case 'low_cost':
                // Prioritize Cost Efficiency
                // Rule: If Cost is Low THEN Score is High
                score = (effScore * 0.3) +
                    (Math.pow(costScore, 0.3) * 0.6) +
                    (safetyScore * 0.1);
                break;

            case 'balanced':
            default:
                // Balanced trade-off
                // Rule: Average of Effectiveness, Cost, and Safety
                score = (effScore * 0.45) +
                    (costScore * 0.35) +
                    (safetyScore * 0.2);
                break;
        }

        return score;
    }

    selectTreatments(sortedTreatments, strategy) {
        const selected = [];

        // Strategy-specific selection logic
        switch (strategy) {
            case 'high_effectiveness':
                // Prioritize chemicals for maximum effectiveness
                const MAX_HIGH_EFF = 4;
                const chemicals = sortedTreatments.filter(t => t.type === 'chemical');
                const naturals = sortedTreatments.filter(t => t.type === 'natural');
                const preventions = sortedTreatments.filter(t => t.type === 'prevention');

                // Take top 2 chemicals if available
                selected.push(...chemicals.slice(0, 2));
                // Add 1 natural
                if (naturals.length > 0) selected.push(naturals[0]);
                // Add 1 prevention
                if (preventions.length > 0) selected.push(preventions[0]);
                break;

            case 'low_cost':
                // Prioritize natural and prevention treatments
                const MAX_LOW_COST = 5;
                const natTreatments = sortedTreatments.filter(t => t.type === 'natural');
                const prevTreatments = sortedTreatments.filter(t => t.type === 'prevention');
                const chemTreatments = sortedTreatments.filter(t => t.type === 'chemical');

                // Take top 2 naturals
                selected.push(...natTreatments.slice(0, 2));
                // Take top 2 preventions
                selected.push(...prevTreatments.slice(0, 2));
                // Add 1 chemical only if severity is high
                if (this.severity > 0.6 && chemTreatments.length > 0) {
                    selected.push(chemTreatments[0]);
                }
                break;

            case 'balanced':
            default:
                // Balanced mix of all types
                const MAX_BALANCED = 5;
                const pickType = (type) => sortedTreatments.find(t => t.type === type);

                const bestChem = pickType('chemical');
                const bestNat = pickType('natural');
                const bestPrev = pickType('prevention');

                if (bestChem) selected.push(bestChem);
                if (bestNat) selected.push(bestNat);
                if (bestPrev) selected.push(bestPrev);

                // Fill remaining with next best scores
                for (const t of sortedTreatments) {
                    if (selected.length >= MAX_BALANCED) break;
                    if (!selected.includes(t)) {
                        selected.push(t);
                    }
                }
                break;
        }

        return selected;
    }

    calculateMetrics(selected) {
        if (!selected.length) return { effectiveness: 0, cost: 0, environmental_impact: 0 };

        const avg = (key) => selected.reduce((sum, t) => sum + t[key], 0) / selected.length;

        return {
            effectiveness: avg('effectiveness'),
            cost: avg('cost'),
            environmental_impact: avg('side_effects')
        };
    }
}

function optimizeTreatments(treatments, severity) {
    const optimizer = new MultiObjectiveOptimizer(treatments, severity);

    // Generate all strategies
    const balanced = optimizer.optimize('balanced');
    const highEff = optimizer.optimize('high_effectiveness');
    const lowCost = optimizer.optimize('low_cost');

    return {
        status: 'success',
        // Default plan is Balanced
        optimal_plan: balanced.treatments,
        strategies: {
            balanced,
            high_effectiveness: highEff,
            low_cost: lowCost
        },
        meta: {
            engine: "Fuzzy Logic Multi-Objective Optimizer",
            timestamp: new Date().toISOString()
        }
    };
}

module.exports = { optimizeTreatments };
