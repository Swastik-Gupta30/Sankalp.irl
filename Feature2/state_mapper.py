"""
State mapping and utilities for welfare allocation analysis
In this project, each IHDS 'stateid' maps to a Delhi Ward for the prototype.
Ward 1 = stateid 1, Ward 2 = stateid 2, ... Ward 36 = stateid 36
"""

# Ward Mapping: stateid 1-36 → Ward 1-36 (Delhi prototype)
STATE_MAPPING = {i: f"Ward {i}" for i in range(1, 37)}

# Reverse mapping
STATE_NAME_TO_ID = {v: k for k, v in STATE_MAPPING.items()}


def get_state_name(state_id):
    """
    Get ward name from state ID.
    """
    return STATE_MAPPING.get(state_id, f"Ward {state_id}")


def get_state_id(state_name):
    """
    Get state ID from ward name.
    """
    return STATE_NAME_TO_ID.get(state_name)


def analyze_state_coverage(allocations_df):
    """
    Analyze which wards are covered in allocation results.
    """
    if allocations_df.empty:
        return {
            'total_states': len(STATE_MAPPING),
            'covered_states': 0,
            'uncovered_states': list(STATE_MAPPING.values()),
            'coverage_percentage': 0.0,
            'state_beneficiary_counts': {}
        }

    covered_state_ids = allocations_df['stateid'].unique()
    covered_state_names = [get_state_name(sid) for sid in covered_state_ids]
    uncovered_state_names = [
        name for state_id, name in STATE_MAPPING.items()
        if state_id not in covered_state_ids
    ]

    state_counts = allocations_df['stateid'].value_counts().to_dict()
    state_beneficiary_counts = {
        get_state_name(state_id): count
        for state_id, count in state_counts.items()
    }

    coverage_percentage = (len(covered_state_ids) / len(STATE_MAPPING)) * 100

    return {
        'total_states': len(STATE_MAPPING),
        'covered_states': len(covered_state_ids),
        'uncovered_states': uncovered_state_names,
        'coverage_percentage': round(coverage_percentage, 2),
        'state_beneficiary_counts': state_beneficiary_counts,
        'covered_state_list': sorted(covered_state_names)
    }


def analyze_state_wise_metrics(allocations_df):
    """
    Calculate ward-wise metrics for allocation.
    """
    if allocations_df.empty:
        return {}

    state_analysis = {}

    for state_id in allocations_df['stateid'].unique():
        state_data = allocations_df[allocations_df['stateid'] == state_id]
        state_name = get_state_name(state_id)

        total_cost = state_data['cost'].sum()
        total_uplift = state_data['uplift'].sum()
        num_beneficiaries = len(state_data)
        avg_uplift = state_data['uplift'].mean()

        policy_cols = ['cash_transfer', 'food_subsidy', 'training_program', 'nrega_program']
        policy_counts = {}
        for p in policy_cols:
            if p in state_data.columns:
                policy_counts[p] = (state_data[p] > 0).sum()

        primary_policy = max(policy_counts, key=policy_counts.get) if policy_counts else "None"
        primary_policy_label = primary_policy.replace('_', ' ').title()

        roi = (total_uplift / total_cost) if total_cost > 0 else 0
        state_analysis[state_name] = {
            'state_id': int(state_id),
            'beneficiaries': num_beneficiaries,
            'total_cost': round(total_cost, 2),
            'total_uplift': round(total_uplift, 4),
            'avg_uplift': round(avg_uplift, 4),
            'roi': round(roi, 6),
            'roi_per_lakh': round((total_uplift * 100) / (total_cost / 100000), 2) if total_cost > 0 else 0,
            'primary_policy': primary_policy_label
        }

    return state_analysis


def get_policy_distribution_by_state(allocations_df, policy_cols):
    """
    Get policy distribution for each ward.
    """
    if allocations_df.empty:
        return {}

    policy_by_state = {}

    for state_id in allocations_df['stateid'].unique():
        state_name = get_state_name(state_id)
        state_data = allocations_df[allocations_df['stateid'] == state_id]

        policy_counts = {}
        for policy in policy_cols:
            count = (state_data[policy] > 0).sum()
            policy_counts[policy] = int(count)

        policy_by_state[state_name] = policy_counts

    return policy_by_state
