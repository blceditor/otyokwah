#!/usr/bin/env python3
"""
REQ-TEAM-004 - Auth Flow Validator

Validates authentication patterns in Next.js apps.
Used by: security-reviewer.md § Authentication/Authorization

Checks:
- Middleware protection coverage
- Session/cookie security
- Token validation
- Authorization checks
- Auth bypass detection
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Any, Optional


# Auth validation patterns
AUTH_PATTERNS = {
    'jwt_verify': r'(?:verify|decode)\s*\(\s*token',
    'session_check': r'(?:getSession|getServerSession|auth)\s*\(',
    'middleware_auth': r'(?:withAuth|authMiddleware|requireAuth)',
    'user_check': r'(?:currentUser|user)\s*(?:===|!==|==|!=|\?)',
    'role_check': r'(?:\.role\s*===|hasRole|isAdmin|hasPermission)',
    'auth_header': r'request\.headers\.get\s*\(\s*[\'"](?:Authorization|auth)',
    'hmac_verify': r'(?:hmac|signature|X-Hub-Signature|createHmac|timingSafeEqual)',
    'webhook_verify': r'(?:webhook|Webhook|WEBHOOK)',
    'api_key_check': r'(?:REVALIDATE_SECRET|API_KEY|SECRET)',
    'keystatic_handler': r'(?:makeRouteHandler|handleGitHubApp)',
    'rate_limit': r'(?:rateLimit|rateLimiter|X-RateLimit)',
    'custom_auth_fn': r'(?:isAuthenticated|isAuthorized|isKeystati|requireKeystatic)',
    'logout_handler': r'(?:logout|signOut|sign-out|(?:clear|expire|delete).*[Cc]ookie)',
}

# Insecure patterns
INSECURE_PATTERNS = {
    'httponly_false': {
        'pattern': r'httpOnly\s*:\s*false',
        'message': 'Cookie httpOnly should be true',
        'severity': 'high'
    },
    'secure_false': {
        'pattern': r'secure\s*:\s*false',
        'message': 'Cookie secure should be true in production',
        'severity': 'medium'
    },
    'samesite_none': {
        'pattern': r'sameSite\s*:\s*[\'"]none[\'"]',
        'message': 'sameSite=none weakens CSRF protection',
        'severity': 'medium'
    },
    'hardcoded_secret': {
        'pattern': r'(?:sign|verify)\s*\([^,]+,\s*[\'"][^\'"]+[\'"]',
        'message': 'JWT secret appears hardcoded',
        'severity': 'critical'
    },
    'skip_auth_env': {
        'pattern': r'SKIP_AUTH|DISABLE_AUTH|NO_AUTH',
        'message': 'Auth bypass flag detected',
        'severity': 'high'
    },
    'commented_auth': {
        'pattern': r'//\s*(?:if\s*\(!?(?:isAuthenticated|isAuthorized|auth|session))',
        'message': 'Commented out auth check detected',
        'severity': 'critical'
    }
}


def check_middleware_protection(project_dir: str) -> Dict[str, Any]:
    """Check which routes are protected by middleware."""
    result = {
        'middleware_found': False,
        'protected_routes': [],
        'unprotected_routes': [],
        'matcher_config': None
    }

    project_path = Path(project_dir)

    # Find middleware.ts
    middleware_paths = [
        project_path / 'middleware.ts',
        project_path / 'src' / 'middleware.ts',
        project_path / 'middleware.js',
    ]

    middleware_content = None
    for mw_path in middleware_paths:
        if mw_path.exists():
            result['middleware_found'] = True
            middleware_content = mw_path.read_text()
            break

    if not middleware_content:
        return result

    # Extract matcher config
    matcher_match = re.search(
        r'export\s+const\s+config\s*=\s*\{\s*matcher\s*:\s*\[(.*?)\]',
        middleware_content,
        re.DOTALL
    )

    if matcher_match:
        matchers_str = matcher_match.group(1)
        matchers = re.findall(r'[\'"]([^\'"]+)[\'"]', matchers_str)
        result['matcher_config'] = matchers

        # Convert matchers to regex patterns
        protected_patterns = []
        for m in matchers:
            pattern = m.replace(':path*', '.*').replace('*', '.*')
            protected_patterns.append(pattern)

        result['protected_routes'] = matchers

    # Find all API routes
    app_dir = project_path / 'app'
    if app_dir.exists():
        for route_file in app_dir.rglob('route.ts'):
            route_path = '/' + str(route_file.parent.relative_to(app_dir))
            route_path = route_path.replace('\\', '/')

            # Check if protected
            is_protected = False
            if result['matcher_config']:
                for pattern in result['matcher_config']:
                    regex_pattern = pattern.replace(':path*', '.*').replace('*', '.*')
                    if re.match(regex_pattern, route_path):
                        is_protected = True
                        break

            if not is_protected:
                result['unprotected_routes'].append(route_path)

    return result


def analyze_session_management(code: str) -> Dict[str, Any]:
    """Analyze session/cookie security settings."""
    result = {
        'issues': [],
        'warnings': [],
        'secure_settings': []
    }

    # Check for cookie settings
    cookie_match = re.search(
        r'cookies\(\)\.set\s*\([^,]+,\s*[^,]+,\s*\{([^}]+)\}',
        code,
        re.DOTALL
    )

    if cookie_match:
        settings = cookie_match.group(1)

        for name, config in INSECURE_PATTERNS.items():
            if name in ['httponly_false', 'secure_false', 'samesite_none']:
                if re.search(config['pattern'], settings):
                    result['issues'].append(f"{config['severity']}: {config['message']}")

        # Check for secure settings
        if 'httpOnly: true' in settings or 'httpOnly:true' in settings:
            result['secure_settings'].append('httpOnly enabled')
        if 'secure: true' in settings or 'secure:true' in settings:
            result['secure_settings'].append('secure enabled')
        if re.search(r'sameSite\s*:\s*[\'"](?:strict|lax)[\'"]', settings, re.IGNORECASE):
            result['secure_settings'].append('sameSite set properly')

    # Check for session regeneration warning
    if 'login' in code.lower() or 'authenticate' in code.lower():
        if not re.search(r'regenerate|newSession|createSession', code):
            result['warnings'].append('session_regeneration: Consider regenerating session after login')

    return result


def check_token_validation(code: str) -> Dict[str, Any]:
    """Check for proper token validation."""
    result = {
        'has_validation': False,
        'issues': [],
        'validation_methods': []
    }

    # Check for JWT verification
    if re.search(AUTH_PATTERNS['jwt_verify'], code):
        result['has_validation'] = True
        result['validation_methods'].append('jwt_verify')

    # Check for session check
    if re.search(AUTH_PATTERNS['session_check'], code):
        result['has_validation'] = True
        result['validation_methods'].append('session_check')

    # Check for auth header
    if re.search(AUTH_PATTERNS['auth_header'], code):
        result['has_validation'] = True
        result['validation_methods'].append('auth_header_check')

    # Check for hardcoded secrets
    if re.search(INSECURE_PATTERNS['hardcoded_secret']['pattern'], code):
        result['issues'].append('Hardcoded secret detected - use environment variables')

    return result


def check_authorization(code: str) -> Dict[str, Any]:
    """Check for proper authorization controls."""
    result = {
        'has_issues': False,
        'issues': [],
        'warnings': [],
        'confidence': 'low'
    }

    # Look for database operations without auth checks
    db_ops = re.findall(
        r'(?:delete|update|create)\s*\(\s*\{[^}]*\}',
        code,
        re.IGNORECASE
    )

    if db_ops:
        # Check if there's a role/permission check
        has_role_check = bool(re.search(AUTH_PATTERNS['role_check'], code))
        has_user_check = bool(re.search(AUTH_PATTERNS['user_check'], code))

        if has_role_check or has_user_check:
            result['confidence'] = 'high'
        else:
            result['has_issues'] = True
            result['issues'].append(
                'Database mutation without visible permission check'
            )
            result['warnings'].append(
                'bola: Potential broken object-level authorization'
            )

    return result


def detect_auth_bypass(code: str) -> Dict[str, Any]:
    """Detect potential auth bypass patterns."""
    result = {
        'risks': [],
        'severity': 'low'
    }

    # Check for commented auth
    if re.search(INSECURE_PATTERNS['commented_auth']['pattern'], code):
        result['risks'].append('Commented out auth check detected')
        result['severity'] = 'critical'

    # Check for skip auth flags
    if re.search(INSECURE_PATTERNS['skip_auth_env']['pattern'], code):
        result['risks'].append('Auth bypass flag detected')
        result['severity'] = 'high'

    # Check for dev/debug bypass
    dev_bypass = re.search(
        r'(?:NODE_ENV|ENVIRONMENT)\s*===?\s*[\'"](?:development|dev|test)[\'"].*(?:return|skip)',
        code
    )
    if dev_bypass:
        result['risks'].append('Development environment auth bypass')
        result['severity'] = 'medium'

    return result


def has_any_auth_pattern(code: str) -> bool:
    """Check if code contains any recognized auth pattern."""
    return any(re.search(pattern, code) for pattern in AUTH_PATTERNS.values())


def check_server_action_auth(code: str) -> Dict[str, Any]:
    """Check auth in Next.js server actions."""
    result = {
        'is_server_action': False,
        'has_auth_check': False,
        'issues': []
    }

    if "'use server'" in code or '"use server"' in code:
        result['is_server_action'] = True
        result['has_auth_check'] = has_any_auth_pattern(code)

        if not result['has_auth_check']:
            result['issues'].append('Server action without visible auth check')

    return result


DANGEROUS_HTTP_METHODS = {'POST', 'PUT', 'PATCH', 'DELETE'}

# Routes that intentionally accept mutations without auth
PUBLIC_MUTATION_ALLOWLIST = {
    'app/api/vitals/route.ts',
    'app/api/contact/route.ts',
    'app/api/submit-bug/route.ts',
    'app/api/search-index/route.ts',
}


def check_route_handler_auth(code: str) -> Dict[str, Any]:
    """Check auth in Next.js route handlers."""
    methods = re.findall(
        r'export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)',
        code
    )
    has_auth = has_any_auth_pattern(code)

    issues = []
    if any(m in DANGEROUS_HTTP_METHODS for m in methods) and not has_auth:
        issues.append(f'Route handler with {", ".join(methods)} but no visible auth')

    return {
        'has_auth_check': has_auth,
        'http_methods': methods,
        'issues': issues,
    }


def validate_auth_flow(project_dir: str) -> Dict[str, Any]:
    """Validate complete auth flow for a project."""
    result = {
        'middleware_config': None,
        'login_endpoint': None,
        'protected_routes': [],
        'unprotected_routes': [],
        'issues': [],
        'no_auth_required': False
    }

    project_path = Path(project_dir)

    # Check middleware
    mw_result = check_middleware_protection(project_dir)
    result['middleware_config'] = mw_result.get('matcher_config')
    result['protected_routes'] = mw_result.get('protected_routes', [])
    result['unprotected_routes'] = mw_result.get('unprotected_routes', [])

    if not mw_result['middleware_found']:
        # Check if this is a public-only site
        app_dir = project_path / 'app'
        if app_dir.exists():
            has_api_routes = any(app_dir.rglob('route.ts')) or any(app_dir.rglob('route.js'))
            if not has_api_routes:
                result['no_auth_required'] = True
                return result

    # Find login endpoint
    app_dir = project_path / 'app'
    if app_dir.exists():
        login_paths = [
            app_dir / 'api' / 'auth' / 'login' / 'route.ts',
            app_dir / 'api' / 'login' / 'route.ts',
            app_dir / '(auth)' / 'login' / 'page.tsx',
        ]
        for login_path in login_paths:
            if login_path.exists():
                result['login_endpoint'] = str(login_path.relative_to(project_path))
                break

    # Scan route handlers for auth issues
    if app_dir.exists():
        for route_file in app_dir.rglob('route.ts'):
            try:
                rel_path = str(route_file.relative_to(project_path))
                if rel_path in PUBLIC_MUTATION_ALLOWLIST:
                    continue
                content = route_file.read_text()
                route_result = check_route_handler_auth(content)
                if route_result['issues']:
                    result['issues'].extend([
                        f"{rel_path}: {issue}"
                        for issue in route_result['issues']
                    ])
            except Exception:
                pass

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python auth_flow_validator.py <project_directory>")
        sys.exit(1)

    project_dir = sys.argv[1]
    result = validate_auth_flow(project_dir)

    print(json.dumps(result, indent=2))

    # Exit with error if critical issues
    if result.get('issues'):
        sys.exit(1)


if __name__ == "__main__":
    main()
