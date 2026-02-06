// Sample data - In production, this would come from a backend API
const availableDomains = [
    {
        name: 'subhub.dev',
        description: 'Perfect for development projects and portfolios',
        available: 847,
        total: 1000,
        badge: 'popular',
        provider: 'Cloudflare'
    },
    {
        name: 'free.io',
        description: 'Great for side projects and experiments',
        available: 923,
        total: 1000,
        badge: 'new',
        provider: 'Vercel'
    },
    {
        name: 'mysite.app',
        description: 'Professional domain for web applications',
        available: 656,
        total: 1000,
        badge: 'popular',
        provider: 'Netlify'
    },
    {
        name: 'dev.zone',
        description: 'Developer-focused domain for tech projects',
        available: 789,
        total: 1000,
        badge: null,
        provider: 'Cloudflare'
    },
    {
        name: 'cloud.link',
        description: 'Cloud-native applications and services',
        available: 912,
        total: 1000,
        badge: 'new',
        provider: 'AWS Route 53'
    },
    {
        name: 'project.works',
        description: 'Showcase your work and projects',
        available: 534,
        total: 1000,
        badge: 'popular',
        provider: 'DigitalOcean'
    }
];

// DNS Record validation rules
const recordTypeValidation = {
    A: {
        hint: 'Enter a valid IPv4 address (e.g., 192.168.1.1)',
        placeholder: '192.168.1.1',
        validate: (value) => /^(\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split('.').every(n => parseInt(n) <= 255)
    },
    AAAA: {
        hint: 'Enter a valid IPv6 address (e.g., 2001:db8::1)',
        placeholder: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        validate: (value) => /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(value) || /^([\da-f]{0,4}:){1,7}:$/i.test(value)
    },
    CNAME: {
        hint: 'Enter a valid domain name (e.g., example.com)',
        placeholder: 'example.com',
        validate: (value) => /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(value)
    },
    URL: {
        hint: 'Enter a complete URL (e.g., https://example.com)',
        placeholder: 'https://example.com',
        validate: (value) => /^https?:\/\/.+\..+/.test(value)
    }
};

// User's claimed subdomains (stored in localStorage)
let userSubdomains = JSON.parse(localStorage.getItem('userSubdomains')) || [];

// DOM Elements
const subdomainInput = document.getElementById('subdomain-input');
const domainSelect = document.getElementById('domain-select');
const searchBtn = document.getElementById('search-btn');
const availabilityResults = document.getElementById('availability-results');
const domainsGrid = document.getElementById('domains-grid');
const subdomainsList = document.getElementById('subdomains-list');
const subdomainCount = document.getElementById('subdomain-count');
const claimModal = document.getElementById('claim-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const claimForm = document.getElementById('claim-form');
const contributeForm = document.getElementById('contribute-form');
const advancedToggle = document.getElementById('advanced-toggle');
const advancedPanel = document.getElementById('advanced-panel');
const massSearchToggle = document.getElementById('mass-search-toggle');
const massSearchPanel = document.getElementById('mass-search-panel');
const massSearchInput = document.getElementById('mass-search-input');
const massSearchBtn = document.getElementById('mass-search-btn');
const massSearchCount = document.getElementById('mass-search-count');
const massResults = document.getElementById('mass-results');
const quickRecordType = document.getElementById('quick-record-type');
const quickDestination = document.getElementById('quick-destination');
const recordTypeSelect = document.getElementById('record-type');
const targetUrlInput = document.getElementById('target-url');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderDomainCards();
    renderUserSubdomains();
    updateSubdomainCount();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', checkAvailability);
    subdomainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAvailability();
    });
    
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    
    claimForm.addEventListener('submit', handleClaimSubmit);
    contributeForm.addEventListener('submit', handleContributeSubmit);
    
    // Advanced toggle
    advancedToggle.addEventListener('click', () => {
        advancedPanel.classList.toggle('active');
        advancedToggle.classList.toggle('active');
    });
    
    // Mass search toggle
    massSearchToggle.addEventListener('click', () => {
        massSearchPanel.classList.toggle('active');
        massSearchToggle.classList.toggle('active');
    });
    
    // Mass search input counter
    massSearchInput.addEventListener('input', updateMassSearchCount);
    massSearchBtn.addEventListener('click', performMassSearch);
    
    // Record type change handlers
    quickRecordType.addEventListener('change', (e) => {
        updateRecordHint('record-hint', e.target.value);
        updateDestinationPlaceholder(quickDestination, e.target.value);
    });
    
    recordTypeSelect.addEventListener('change', (e) => {
        updateRecordHint('modal-record-hint', e.target.value);
        updateDestinationPlaceholder(targetUrlInput, e.target.value);
        clearValidationMessage();
    });
    
    // Real-time validation
    targetUrlInput.addEventListener('input', () => {
        validateDestination(targetUrlInput.value, recordTypeSelect.value);
    });
    
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            filterDomains(e.target.dataset.filter);
        });
    });
    
    // Smooth scrolling for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Update record type hint
function updateRecordHint(elementId, recordType) {
    const hintElement = document.getElementById(elementId);
    if (hintElement && recordTypeValidation[recordType]) {
        hintElement.textContent = recordTypeValidation[recordType].hint;
    }
}

// Update destination placeholder
function updateDestinationPlaceholder(inputElement, recordType) {
    if (inputElement && recordTypeValidation[recordType]) {
        inputElement.placeholder = recordTypeValidation[recordType].placeholder;
    }
}

// Validate destination based on record type
function validateDestination(value, recordType) {
    const validation = recordTypeValidation[recordType];
    const messageEl = document.getElementById('validation-message');
    
    if (!value) {
        messageEl.className = 'validation-message';
        return true;
    }
    
    const isValid = validation.validate(value);
    
    if (isValid) {
        messageEl.className = 'validation-message success';
        messageEl.textContent = '✓ Valid ' + recordType + ' record';
    } else {
        messageEl.className = 'validation-message error';
        messageEl.textContent = '✗ Invalid format. ' + validation.hint;
    }
    
    return isValid;
}

// Clear validation message
function clearValidationMessage() {
    const messageEl = document.getElementById('validation-message');
    messageEl.className = 'validation-message';
    messageEl.textContent = '';
}

// Update mass search count
function updateMassSearchCount() {
    const lines = massSearchInput.value.trim().split('\n').filter(line => line.trim());
    massSearchCount.textContent = `${lines.length} subdomain${lines.length !== 1 ? 's' : ''}`;
}

// Perform mass search
function performMassSearch() {
    const lines = massSearchInput.value.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        showNotification('Please enter at least one subdomain', 'warning');
        return;
    }
    
    if (lines.length > 50) {
        showNotification('Maximum 50 subdomains at once', 'warning');
        return;
    }
    
    const domain = domainSelect.value;
    const results = [];
    
    lines.forEach(subdomain => {
        subdomain = subdomain.trim().toLowerCase();
        if (isValidSubdomain(subdomain)) {
            const fullDomain = `${subdomain}.${domain}`;
            const isTaken = userSubdomains.some(s => s.fullDomain === fullDomain) || Math.random() < 0.3;
            results.push({
                subdomain,
                fullDomain,
                available: !isTaken
            });
        }
    });
    
    displayMassResults(results);
}

// Display mass search results
function displayMassResults(results) {
    const available = results.filter(r => r.available).length;
    const taken = results.length - available;
    
    let html = `
        <div class="mass-results-header">
            <div class="mass-results-title">Bulk Search Results</div>
            <div class="mass-results-stats">
                <div class="mass-stat">
                    <div class="mass-stat-number" style="color: var(--success)">${available}</div>
                    <div class="mass-stat-label">Available</div>
                </div>
                <div class="mass-stat">
                    <div class="mass-stat-number" style="color: var(--danger)">${taken}</div>
                    <div class="mass-stat-label">Taken</div>
                </div>
            </div>
        </div>
        <div class="mass-results-grid">
            ${results.map(result => `
                <div class="mass-result-item ${result.available ? 'available' : 'taken'}">
                    <div class="mass-result-domain">${result.fullDomain}</div>
                    <div class="mass-result-status ${result.available ? 'available' : 'taken'}">
                        <span class="status-dot"></span>
                        ${result.available ? 
                            `<span>Available</span>
                            <button class="claim-btn" onclick="openClaimModal('${result.fullDomain}')" style="margin-left: 0.5rem; padding: 0.25rem 0.75rem; font-size: 0.75rem;">Claim</button>` : 
                            'Taken'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    massResults.innerHTML = html;
    massResults.classList.add('active');
    massResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Check subdomain availability
function checkAvailability() {
    const subdomain = subdomainInput.value.trim().toLowerCase();
    const domain = domainSelect.value;
    
    if (!subdomain) {
        showNotification('Please enter a subdomain name', 'warning');
        return;
    }
    
    if (!isValidSubdomain(subdomain)) {
        showNotification('Invalid subdomain. Use only letters, numbers, and hyphens.', 'danger');
        return;
    }
    
    const fullDomain = `${subdomain}.${domain}`;
    
    // Simulate checking availability
    const isTaken = userSubdomains.some(s => s.fullDomain === fullDomain) || Math.random() < 0.3;
    
    displayAvailabilityResults(subdomain, domain, fullDomain, isTaken);
}

// Validate subdomain
function isValidSubdomain(subdomain) {
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return regex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 63;
}

// Display availability results
function displayAvailabilityResults(subdomain, domain, fullDomain, isTaken) {
    const statusClass = isTaken ? 'taken' : 'available';
    const statusText = isTaken ? 'Taken' : 'Available';
    
    let html = `
        <div class="availability-card">
            <div class="availability-header">
                <div class="availability-domain">${fullDomain}</div>
                <div class="availability-status ${statusClass}">
                    <span class="status-dot"></span>
                    ${statusText}
                </div>
            </div>
    `;
    
    if (!isTaken) {
        html += `
            <button class="claim-btn" onclick="openClaimModal('${fullDomain}')">
                Claim This Subdomain
            </button>
        `;
    }
    
    if (isTaken) {
        const alternatives = generateAlternatives(subdomain, domain);
        html += `
            <div class="alternatives-section">
                <div class="alternatives-title">Available Alternatives</div>
                <div class="alternatives-grid">
                    ${alternatives.map(alt => `
                        <div class="alternative-item" onclick="openClaimModal('${alt}')">
                            <span class="alternative-name">${alt}</span>
                            <button class="claim-btn">Claim</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    availabilityResults.innerHTML = html;
    availabilityResults.classList.add('active');
}

// Generate alternative subdomain suggestions
function generateAlternatives(subdomain, domain) {
    const suffixes = ['app', 'dev', 'web', 'site', 'pro', 'hub'];
    const prefixes = ['my', 'get', 'the', 'new', 'try'];
    const alternatives = [];
    
    // Add suffix variations
    for (let i = 0; i < 2; i++) {
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        alternatives.push(`${subdomain}-${suffix}.${domain}`);
    }
    
    // Add prefix variations
    for (let i = 0; i < 2; i++) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        alternatives.push(`${prefix}${subdomain}.${domain}`);
    }
    
    // Add number variations
    alternatives.push(`${subdomain}${Math.floor(Math.random() * 100)}.${domain}`);
    alternatives.push(`${subdomain}${new Date().getFullYear()}.${domain}`);
    
    return alternatives.slice(0, 6);
}

// Open claim modal
function openClaimModal(fullDomain) {
    if (userSubdomains.length >= 5) {
        showNotification('You have reached the maximum of 5 subdomains', 'warning');
        return;
    }
    
    document.getElementById('modal-subdomain').textContent = fullDomain;
    claimModal.setAttribute('data-domain', fullDomain);
    claimModal.classList.add('active');
}

// Close modal
function closeModal() {
    claimModal.classList.remove('active');
}

// Handle claim form submission
function handleClaimSubmit(e) {
    e.preventDefault();
    
    const fullDomain = claimModal.getAttribute('data-domain');
    const targetUrl = document.getElementById('target-url').value.trim();
    const recordType = document.getElementById('record-type').value;
    const ttl = document.getElementById('ttl').value;
    
    // Validate destination
    if (!validateDestination(targetUrl, recordType)) {
        showNotification('Please enter a valid ' + recordType + ' destination', 'danger');
        return;
    }
    
    if (userSubdomains.some(s => s.fullDomain === fullDomain)) {
        showNotification('You already own this subdomain', 'warning');
        return;
    }
    
    const newSubdomain = {
        fullDomain,
        targetUrl,
        recordType,
        ttl,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    userSubdomains.push(newSubdomain);
    localStorage.setItem('userSubdomains', JSON.stringify(userSubdomains));
    
    renderUserSubdomains();
    updateSubdomainCount();
    closeModal();
    
    // Clear form
    claimForm.reset();
    clearValidationMessage();
    
    showNotification('Subdomain claimed successfully! DNS propagation may take up to 48 hours.', 'success');
    
    // Clear availability results
    availabilityResults.classList.remove('active');
    massResults.classList.remove('active');
    subdomainInput.value = '';
}

// Handle contribute form submission
function handleContributeSubmit(e) {
    e.preventDefault();
    
    const domainName = document.getElementById('domain-name').value;
    const dnsProvider = document.getElementById('dns-provider').value;
    const contactEmail = document.getElementById('contact-email').value;
    
    // In production, this would send data to backend
    showNotification('Thank you for contributing! We will review your domain.', 'success');
    
    contributeForm.reset();
}

// Render domain cards
function renderDomainCards(filter = 'all') {
    let domains = availableDomains;
    
    if (filter === 'popular') {
        domains = domains.filter(d => d.badge === 'popular');
    } else if (filter === 'new') {
        domains = domains.filter(d => d.badge === 'new');
    }
    
    domainsGrid.innerHTML = domains.map(domain => {
        const percentage = ((domain.total - domain.available) / domain.total * 100).toFixed(0);
        
        return `
            <div class="domain-card">
                <div class="domain-header">
                    <div class="domain-name">.${domain.name}</div>
                    ${domain.badge ? `<div class="domain-badge ${domain.badge}">${domain.badge}</div>` : ''}
                </div>
                <div class="domain-stats">
                    <div class="domain-stat">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M8 4v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        ${domain.available} available
                    </div>
                    <div class="domain-stat">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M5 7h6M5 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        ${percentage}% used
                    </div>
                </div>
                <div class="domain-description">
                    ${domain.description}
                </div>
                <button class="domain-action" onclick="selectDomain('${domain.name}')">
                    Use This Domain
                </button>
            </div>
        `;
    }).join('');
}

// Filter domains
function filterDomains(filter) {
    renderDomainCards(filter);
}

// Select domain from card
function selectDomain(domainName) {
    domainSelect.value = domainName;
    subdomainInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showNotification(`Selected .${domainName}`, 'success');
}

// Render user subdomains
function renderUserSubdomains() {
    if (userSubdomains.length === 0) {
        subdomainsList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" opacity="0.3"/>
                    <path d="M32 20v24M20 32h24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>No subdomains claimed yet</p>
                <span>Search for a subdomain above to get started</span>
            </div>
        `;
        return;
    }
    
    subdomainsList.innerHTML = userSubdomains.map((subdomain, index) => {
        const recordBadgeColor = {
            A: 'var(--success)',
            AAAA: 'var(--primary)',
            CNAME: 'var(--secondary)',
            URL: 'var(--warning)'
        };
        
        return `
        <div class="subdomain-item">
            <div class="subdomain-info">
                <div class="subdomain-url">
                    ${subdomain.fullDomain}
                    <span style="font-size: 0.75rem; margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: ${recordBadgeColor[subdomain.recordType] || 'var(--text-muted)'}20; color: ${recordBadgeColor[subdomain.recordType] || 'var(--text-muted)'}; border-radius: 4px; font-weight: 600;">${subdomain.recordType}</span>
                </div>
                <div class="subdomain-target">
                    → <span style="color: var(--primary); font-family: monospace;">${subdomain.targetUrl}</span>
                    <span style="margin-left: 1rem; opacity: 0.5;">TTL: ${subdomain.ttl || '3600'}s</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                    Created: ${new Date(subdomain.createdAt).toLocaleDateString()}
                </div>
            </div>
            <div class="subdomain-actions">
                <button class="action-btn" onclick="editSubdomain(${index})">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 0.25rem;">
                        <path d="M10 1L13 4L5 12H2V9L10 1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                </button>
                <button class="action-btn danger" onclick="deleteSubdomain(${index})">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-right: 0.25rem;">
                        <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `}).join('');
}

// Update subdomain count
function updateSubdomainCount() {
    subdomainCount.textContent = `${userSubdomains.length}/5 used`;
}

// Delete subdomain
function deleteSubdomain(index) {
    if (confirm('Are you sure you want to delete this subdomain?')) {
        userSubdomains.splice(index, 1);
        localStorage.setItem('userSubdomains', JSON.stringify(userSubdomains));
        renderUserSubdomains();
        updateSubdomainCount();
        showNotification('Subdomain deleted', 'success');
    }
}

// Edit subdomain
function editSubdomain(index) {
    const subdomain = userSubdomains[index];
    
    const newTargetUrl = prompt('Enter new target URL:', subdomain.targetUrl);
    if (newTargetUrl && newTargetUrl !== subdomain.targetUrl) {
        userSubdomains[index].targetUrl = newTargetUrl;
        localStorage.setItem('userSubdomains', JSON.stringify(userSubdomains));
        renderUserSubdomains();
        showNotification('Subdomain updated', 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#6366f1'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.4s ease-out;
        max-width: 400px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-out';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Add animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Make functions globally accessible
window.openClaimModal = openClaimModal;
window.selectDomain = selectDomain;
window.deleteSubdomain = deleteSubdomain;
window.editSubdomain = editSubdomain;
