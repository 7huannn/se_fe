// controllers/group-calendar/group-calendar-sidebar.js

/**
 * Initialize the group calendar sidebar with team list
 */
export function initGroupCalendarSidebar() {
  const teamsListElement = document.querySelector('[data-teams-list]');
  
  if (!teamsListElement) return;
  
  // Load teams from localStorage
  function loadTeams() {
    const teamsData = localStorage.getItem('schedigo_teams');
    return teamsData ? JSON.parse(teamsData) : [];
  }
  
  // Render team items in the sidebar
  function renderTeams() {
    const teams = loadTeams();
    
    if (teams.length === 0) {
      teamsListElement.innerHTML = `
        <div class="empty-teams">
          <p>No teams found</p>
          <button class="empty-teams-button">Create or join a team</button>
        </div>
      `;
      
      // Handle create team button click
      const createTeamButton = teamsListElement.querySelector('.empty-teams-button');
      if (createTeamButton) {
        createTeamButton.addEventListener('click', () => {
          window.location.href = 'group.html';
        });
      }
      
      return;
    }
    
    // Clear existing content
    teamsListElement.innerHTML = '';
    
    // Create team items
    teams.forEach(team => {
      const teamElement = createTeamElement(team);
      teamsListElement.appendChild(teamElement);
    });
  }
  
  // Create a team element for the sidebar
  function createTeamElement(team) {
    const teamElement = document.createElement('div');
    teamElement.className = 'team-item';
    teamElement.dataset.teamId = team.id;
    
    // Get color class based on team color
    const colorClass = getColorClass(team.color);
    
    teamElement.innerHTML = `
      <div class="team-icon ${colorClass}">${team.initials}</div>
      <div class="team-info">
        <div class="team-name">${team.name}</div>
        <div class="team-privacy">
          <i>${team.privacy === 'private' ? '🔒' : '🌐'}</i>
          ${team.privacy === 'private' ? 'Private' : 'Public'}
        </div>
      </div>
    `;
    
    // Add click event to select team
    teamElement.addEventListener('click', () => {
      // Remove active class from all teams
      document.querySelectorAll('.team-item').forEach(el => {
        el.classList.remove('active');
      });
      
      // Add active class to selected team
      teamElement.classList.add('active');
      
      // Dispatch event for team selection
      document.dispatchEvent(new CustomEvent('team-select', {
        detail: { team },
        bubbles: true
      }));
    });
    
    return teamElement;
  }
  
  // Helper function to map color code to CSS class
  function getColorClass(colorCode) {
    const colorMap = {
      'blue': 'team-blue',
      'orange': 'team-orange',
      'green': 'team-green',
      'purple': 'team-purple',
      'red': 'team-pink'
    };
    
    return colorMap[colorCode] || 'team-blue';
  }
  
  // Listen for teams changes (e.g., when a team is created, updated, or deleted)
  document.addEventListener('teams-change', () => {
    renderTeams();
  });
  
  // Add Group Calendar to sidebar menu
  function updateSidebarMenu() {
    const sidebarMenu = document.getElementById('sidebar-menu');
    if (!sidebarMenu) return;
    
    const gridMenu = sidebarMenu.querySelector('.grid-menu');
    if (!gridMenu) return;
    
    // Check if Group Calendar menu item already exists
    if (!gridMenu.querySelector('#btn-group-calendar')) {
      const groupCalendarBtn = document.createElement('button');
      groupCalendarBtn.id = 'btn-group-calendar';
      groupCalendarBtn.className = 'menu-card';
      groupCalendarBtn.innerHTML = '<i class="icon">🗓️</i><span>Group Calendar</span>';
      
      gridMenu.appendChild(groupCalendarBtn);
      
      // Add click event to redirect to group calendar page
      groupCalendarBtn.addEventListener('click', () => {
        window.location.href = 'group-calendar.html';
      });
    }
  }
  
  // Initialize
  renderTeams();
  updateSidebarMenu();
  
  // Setup navigation from Group Calendar icon in sidebar
  const groupCalendarBtn = document.getElementById('btn-group-calendar');
  if (groupCalendarBtn) {
    groupCalendarBtn.addEventListener('click', () => {
      // If already on group calendar page, do nothing
      if (window.location.pathname.includes('group-calendar.html')) {
        return;
      }
      
      window.location.href = 'group-calendar.html';
    });
  }
}