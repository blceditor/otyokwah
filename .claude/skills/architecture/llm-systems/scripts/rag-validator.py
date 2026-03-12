#!/usr/bin/env python3
"""
RAG Configuration Validator

Validates RAG configuration against best practices for chunking, retrieval, and context management.

Usage:
    python rag-validator.py <config-file.json>

Expected config format:
{
  "chunking": {
    "strategy": "semantic | sentence-window | hierarchical",
    "chunk_size": 500,
    "overlap": 0.1
  },
  "retrieval": {
    "top_k": 10,
    "reranker": "cohere | crossencoder | none",
    "hybrid_search": true
  },
  "context": {
    "max_tokens": 4000,
    "reserve_for_response": 0.5
  }
}

Output (JSON):
{
  "valid": false,
  "issues": ["chunk_size > 1000 reduces precision", ...],
  "recommendations": ["Use semantic chunking with 500-800 chars", ...],
  "score": 7/10
}
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any


def validate_chunking(config: Dict[str, Any]) -> tuple[List[str], List[str]]:
    """Validate chunking configuration"""
    issues = []
    recommendations = []

    chunking = config.get("chunking", {})

    # Validate strategy
    strategy = chunking.get("strategy")
    valid_strategies = ["semantic", "sentence-window", "hierarchical"]

    if strategy not in valid_strategies:
        issues.append(f"Invalid chunking strategy: {strategy}. Must be one of {valid_strategies}")
    elif strategy == "semantic":
        recommendations.append("✓ Semantic chunking: Good for preserving context")

    # Validate chunk_size
    chunk_size = chunking.get("chunk_size", 0)

    if chunk_size > 1000:
        issues.append(f"chunk_size={chunk_size} > 1000 reduces retrieval precision")
        recommendations.append("Reduce chunk_size to 500-800 characters")
    elif chunk_size < 200:
        issues.append(f"chunk_size={chunk_size} < 200 may fragment context")
        recommendations.append("Increase chunk_size to 500-800 characters")
    else:
        recommendations.append("✓ Chunk size: Good range (500-800 chars)")

    # Validate overlap
    overlap = chunking.get("overlap", 0)

    if overlap < 0.1:
        issues.append(f"overlap={overlap} < 0.1 may lose context between chunks")
        recommendations.append("Set overlap to 0.1-0.15 (10-15%)")
    elif overlap > 0.3:
        issues.append(f"overlap={overlap} > 0.3 wastes storage and retrieval time")
        recommendations.append("Reduce overlap to 0.1-0.15")
    else:
        recommendations.append("✓ Overlap: Good range (10-15%)")

    return issues, recommendations


def validate_retrieval(config: Dict[str, Any]) -> tuple[List[str], List[str]]:
    """Validate retrieval configuration"""
    issues = []
    recommendations = []

    retrieval = config.get("retrieval", {})

    # Validate top_k
    top_k = retrieval.get("top_k", 0)

    if top_k > 20:
        issues.append(f"top_k={top_k} > 20 adds noise to context")
        recommendations.append("Reduce top_k to 5-10 after reranking")
    elif top_k < 3:
        issues.append(f"top_k={top_k} < 3 may miss relevant context")
        recommendations.append("Increase top_k to 5-10")
    else:
        recommendations.append("✓ top_k: Good range (5-10)")

    # Validate reranker
    reranker = retrieval.get("reranker", "none")

    if reranker == "none":
        issues.append("No reranker configured")
        recommendations.append("Add reranker (Cohere or CrossEncoder) to improve relevance")
    elif reranker in ["cohere", "crossencoder"]:
        recommendations.append(f"✓ Reranker: {reranker} improves precision")
    else:
        issues.append(f"Unknown reranker: {reranker}")

    # Validate hybrid_search
    hybrid_search = retrieval.get("hybrid_search", False)

    if not hybrid_search:
        recommendations.append("Enable hybrid_search (vector + keyword) for better recall")
    else:
        recommendations.append("✓ Hybrid search: Combines vector + keyword retrieval")

    return issues, recommendations


def validate_context(config: Dict[str, Any]) -> tuple[List[str], List[str]]:
    """Validate context management"""
    issues = []
    recommendations = []

    context = config.get("context", {})

    # Validate max_tokens
    max_tokens = context.get("max_tokens", 0)

    if max_tokens > 100000:
        issues.append(f"max_tokens={max_tokens} exceeds most LLM context windows")
        recommendations.append("Set max_tokens to model limit (e.g., 128k for Claude 3.5)")

    # Validate reserve_for_response
    reserve = context.get("reserve_for_response", 0.5)

    if reserve < 0.3:
        issues.append(f"reserve_for_response={reserve} < 0.3 may truncate LLM responses")
        recommendations.append("Reserve 30-50% of context window for response")
    elif reserve > 0.7:
        issues.append(f"reserve_for_response={reserve} > 0.7 wastes retrieval capacity")
        recommendations.append("Reserve 30-50% of context window for response")
    else:
        recommendations.append("✓ Context reserve: Good balance (30-50%)")

    return issues, recommendations


def calculate_score(total_issues: int, total_recommendations: int) -> float:
    """Calculate configuration quality score (0-10)"""
    # Perfect score: 0 issues, all best practices
    # Deduct 1 point per issue
    score = max(0, 10 - total_issues)
    return score


def main():
    if len(sys.argv) < 2:
        print("Usage: python rag-validator.py <config-file.json>", file=sys.stderr)
        sys.exit(1)

    config_file = sys.argv[1]

    if not Path(config_file).exists():
        print(json.dumps({
            "error": f"Config file not found: {config_file}"
        }))
        sys.exit(1)

    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)

        # Validate each section
        chunking_issues, chunking_recs = validate_chunking(config)
        retrieval_issues, retrieval_recs = validate_retrieval(config)
        context_issues, context_recs = validate_context(config)

        # Combine results
        all_issues = chunking_issues + retrieval_issues + context_issues
        all_recommendations = chunking_recs + retrieval_recs + context_recs

        # Calculate score
        score = calculate_score(len(all_issues), len(all_recommendations))

        result = {
            "valid": len(all_issues) == 0,
            "issues": all_issues,
            "recommendations": all_recommendations,
            "score": f"{score}/10",
            "sections": {
                "chunking": {
                    "issues": chunking_issues,
                    "recommendations": chunking_recs
                },
                "retrieval": {
                    "issues": retrieval_issues,
                    "recommendations": retrieval_recs
                },
                "context": {
                    "issues": context_issues,
                    "recommendations": context_recs
                }
            }
        }

        print(json.dumps(result, indent=2))

        # Exit with error if issues found
        if all_issues:
            sys.exit(1)

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
