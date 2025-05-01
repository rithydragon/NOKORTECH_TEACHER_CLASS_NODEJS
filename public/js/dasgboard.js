document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                    
                    // Update breadcrumb
                    document.querySelector('.current-page').textContent = 
                        item.querySelector('span').textContent;
                    
                    // Load section data
                    loadSectionData(sectionId);
                }
            });
        });
    });

    // Load initial section data
    loadSectionData('overview');

    // Initialize charts
    initCharts();

    // Event listeners for refresh buttons
    document.getElementById('refreshApis').addEventListener('click', () => loadApiStatus());
    document.getElementById('refreshRoutes').addEventListener('click', () => loadRoutes());

    // Route search functionality
    document.getElementById('routeSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#routesTableBody tr');
        
        rows.forEach(row => {
            const path = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const method = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
            
            if (path.includes(searchTerm) || method.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('routeDetailModal').classList.remove('active');
    });
});

// Load section data
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'overview':
            loadOverviewData();
            break;
        case 'apis':
            loadApiStatus();
            break;
        case 'routes':
            loadRoutes();
            break;
        case 'metrics':
            loadMetrics();
            break;
        case 'database':
            loadDatabaseInfo();
            break;
        case 'speech':
            loadSpeechAnalysis();
            break;
    }
}

// Load overview data
function loadOverviewData() {
    fetch('/api/dashboard/overview')
        .then(response => response.json())
        .then(data => {
            // Update stats grid
            const statsGrid = document.querySelector('.stats-grid');
            statsGrid.innerHTML = '';
            
            data.stats.forEach(stat => {
                const statCard = document.createElement('div');
                statCard.className = 'stat-card';
                statCard.innerHTML = `
                    <div class="stat-header">
                        <h3>${stat.title}</h3>
                        <i class="fas ${stat.icon}"></i>
                    </div>
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-change ${stat.trend === 'up' ? 'positive' : 'negative'}">
                        <i class="fas ${stat.trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                        ${stat.change}% from last week
                    </div>
                `;
                statsGrid.appendChild(statCard);
            });
            
            // Update recent activity
            const activityList = document.querySelector('.activity-list');
            activityList.innerHTML = '';
            
            data.recentActivity.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <p>${activity.description}</p>
                        <small>${activity.time}</small>
                    </div>
                `;
                activityList.appendChild(activityItem);
            });
            
            // Update charts
            updateCharts(data.chartData);
        })
        .catch(error => {
            console.error('Error loading overview data:', error);
            showToast('Failed to load dashboard data', 'error');
        });
}

// Load API status
function loadApiStatus() {
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            const apiGrid = document.querySelector('.api-status-grid');
            apiGrid.innerHTML = '';
            
            data.apis.forEach(api => {
                const apiCard = document.createElement('div');
                apiCard.className = `api-card ${api.status}`;
                apiCard.innerHTML = `
                    <div class="api-header">
                        <h3>${api.name}</h3>
                        <span class="status">${api.status === 'healthy' ? 'Operational' : 
                            api.status === 'degraded' ? 'Degraded' : 'Down'}</span>
                    </div>
                    <div class="api-meta">${api.endpoint}</div>
                    <div class="api-stats">
                        <div class="stat">
                            <div class="value">${api.uptime}%</div>
                            <div class="label">Uptime</div>
                        </div>
                        <div class="stat">
                            <div class="value">${api.responseTime}ms</div>
                            <div class="label">Response</div>
                        </div>
                        <div class="stat">
                            <div class="value">${api.requests}</div>
                            <div class="label">Requests</div>
                        </div>
                    </div>
                `;
                apiGrid.appendChild(apiCard);
            });
            
            // Update API traffic chart
            updateApiTrafficChart(data.trafficData);
        })
        .catch(error => {
            console.error('Error loading API status:', error);
            showToast('Failed to load API status', 'error');
        });
}

// Load routes
function loadRoutes() {
    fetch('/api/routes')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#routesTableBody');
            tableBody.innerHTML = '';
            
            data.routes.forEach(route => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <span class="method-badge ${route.method.toLowerCase()}">${route.method}</span>
                    </td>
                    <td>${route.path}</td>
                    <td>
                        <span class="status-indicator ${route.status}"></span>
                        ${route.status === 'active' ? 'Active' : 
                          route.status === 'inactive' ? 'Inactive' : 'Error'}
                    </td>
                    <td>${route.lastUsed}</td>
                    <td>${route.avgResponse}ms</td>
                    <td class="actions">
                        <button class="test-route" data-id="${route.id}">
                            <i class="fas fa-bolt"></i> Test
                        </button>
                        <button class="view-details" data-id="${route.id}">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to route buttons
            document.querySelectorAll('.test-route').forEach(button => {
                button.addEventListener('click', () => testRoute(button.getAttribute('data-id')));
            });
            
            document.querySelectorAll('.view-details').forEach(button => {
                button.addEventListener('click', () => showRouteDetails(button.getAttribute('data-id')));
            });
        })
        .catch(error => {
            console.error('Error loading routes:', error);
            showToast('Failed to load routes', 'error');
        });
}

// Test a route
function testRoute(routeId) {
    fetch(`/api/routes/${routeId}/test`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        showToast(`Tested route successfully. Status: ${data.status}`, 'success');
    })
    .catch(error => {
        console.error('Error testing route:', error);
        showToast('Failed to test route', 'error');
    });
}

// Show route details
function showRouteDetails(routeId) {
    fetch(`/api/routes/${routeId}`)
    .then(response => response.json())
    .then(data => {
        const modalContent = document.getElementById('routeDetailContent');
        modalContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Method</div>
                <div class="detail-value">
                    <span class="method-badge ${data.method.toLowerCase()}">${data.method}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Path</div>
                <div class="detail-value">${data.path}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                    <span class="status-indicator ${data.status}"></span>
                    ${data.status === 'active' ? 'Active' : 
                      data.status === 'inactive' ? 'Inactive' : 'Error'}
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">${data.description || 'No description available'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Last Used</div>
                <div class="detail-value">${data.lastUsed}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Avg. Response</div>
                <div class="detail-value">${data.avgResponse}ms</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Example Request</div>
                <div class="detail-value code">
                    ${data.exampleRequest || 'No example available'}
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Example Response</div>
                <div class="detail-value code">
                    ${data.exampleResponse || 'No example available'}
                </div>
            </div>
        `;
        
        document.getElementById('routeDetailModal').classList.add('active');
    })
    .catch(error => {
        console.error('Error loading route details:', error);
        showToast('Failed to load route details', 'error');
    });
}

// Load metrics
function loadMetrics() {
    fetch('/api/metrics')
    .then(response => response.json())
    .then(data => {
        const metricsSection = document.getElementById('metrics');
        metricsSection.innerHTML = `
            <div class="section-header">
                <h2>System Metrics</h2>
                <button class="refresh-btn" id="refreshMetrics">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            
            <div class="metrics-grid">
                <!-- Metrics will be populated here -->
            </div>
            
            <div class="metrics-charts">
                <div class="chart-container">
                    <h3>CPU Usage</h3>
                    <div class="chart" id="cpuMetricsChart"></div>
                </div>
                <div class="chart-container">
                    <h3>Memory Usage</h3>
                    <div class="chart" id="memoryMetricsChart"></div>
                </div>
            </div>
        `;
        
        // Initialize metrics charts
        initMetricsCharts(data);
        
        // Add refresh button event
        document.getElementById('refreshMetrics').addEventListener('click', loadMetrics);
    })
    .catch(error => {
        console.error('Error loading metrics:', error);
        showToast('Failed to load system metrics', 'error');
    });
}

// Load