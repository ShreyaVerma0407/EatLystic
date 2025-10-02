const style = `
  :root {
    /* Base colors for table progress bars (kept the same) */
    --blue-color: #3b82f6; 
    --green-color: #22c55e;
    --yellow-color: #f59e0b;
    --red-color: #ef4444;

    /* Chart Colors - Macro (Green) */
    --green-light: #4ade80; /* Consumed */
    --green-dark: #16a34a; /* Recommended */

    /* Chart Colors - Energy (Redownlaod) */
    --red-light: #f87171; /* Consumed */
    --red-dark: #dc2626; /* Recommended */
  }
  
  /* --- STICKY NAVBAR STYLES --- */
  .sticky-navbar-container {
    position: sticky;
    top: 0;
    z-index: 1000; 
    background-color: #121215; 
    border-bottom: 1px solid #1f1f24; 
    width: 100%;
  }
/* -------------------------------------------
   --- Nutrition Table Styles (Specificity Increased) ---
   ------------------------------------------- */

/* Targeting the element with a high-specificity selector if possible,
   but mainly ensuring variable consistency. */
.nutrition-comparison-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 12px; /* Increased spacing for visibility */
    color: var(--text-primary) !important; /* Force text color */
    font-size: 1rem;
    margin-top: 20px;
}
 
/* Increased specificity by listing the table class before the element */
.nutrition-comparison-table th, 
.nutrition-comparison-table td {
    padding: 1rem;
    text-align: left;
    /* Use the theme's divider color */
    border-bottom: 1px solid var(--divider-color); 
}

/* Table Header Styles */
.nutrition-comparison-table th {
    background-color: var(--card-bg-color) !important; /* Force dark background */
    font-weight: bold;
    color: var(--text-secondary) !important; /* Force lighter header text */
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    /* Ensure no residual background color bleeds through */
    border-top: 1px solid var(--card-bg-color); 
}

/* Table Body Row Styles */
.nutrition-comparison-table tbody tr {
    /* Use theme's card background, forced */
    background-color: var(--card-bg-color) !important; 
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); /* Stronger shadow for definition */
    transition: background-color 0.2s;
}
 
.nutrition-comparison-table tbody tr:hover {
    /* Use a slightly different dark color for hover contrast */
    background-color: #38383e !important; 
}

/* First column (label) styles */
.nutrition-comparison-table tbody td:first-child {
    font-weight: bold;
    color: var(--accent-color) !important; /* Force orange accent color */
    /* Add border-radius here to contain the row's background */
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
}

/* Last column cell to complete the border-radius */
.nutrition-comparison-table tbody td:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
}

/* Remove bottom border on the last row cells for a clean separation */
.nutrition-comparison-table tbody tr:last-child td {
    border-bottom: none !important;
}
  /* Status Tags */
  .status-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-weight: bold;
    font-size: 0.875rem;
  }

  .status-low {
    background-color: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid #ef4444;
  }

  .status-high {
    background-color: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border: 1px solid #f59e0b;
  }

  .status-normal {
    background-color: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid #22c55e;
  }

  /* Progress Bar in Table */
  .progress-cell {
      display: flex;
      align-items: center;
      gap: 10px;
  }
  
  .progress-bar-small {
    height: 8px;
    width: 100px;
    background-color: #3f3f46;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-bar-fill-small {
    height: 100%;
    transition: width 0.5s ease-in-out;
  }

  /* Summary boxes above table */
  .nutrient-status-summary > div {
    font-size: 1.25rem;
  }
  
  /* --- VERTICAL BAR CHART STYLES --- */
  .vertical-bar-chart-container {
      background-color: #1a1a1f;
      padding: 2rem;
      border-radius: 0.75rem;
      margin-top: 2rem; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }
  
  .chart-main-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #fff;
      margin-bottom: 1.5rem;
      text-align: center;
  }

  /* Local legend styling */
  .chart-legend-local {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
      color: #ccc;
      font-size: 0.8rem;
      font-weight: 500;
  }

  .legend-item {
      display: flex;
      align-items: center;
  }

  .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      margin-right: 0.3rem;
  }

  /* Legend color definitions */
  .legend-color.red-dark-box { background-color: var(--red-dark); }
  .legend-color.red-light-box { background-color: var(--red-light); }
  .legend-color.green-dark-box { background-color: var(--green-dark); }
  .legend-color.green-light-box { background-color: var(--green-light); }


  .chart-groups-wrapper {
      display: flex;
      justify-content: space-around;
      gap: 3rem;
  }

  .chart-group {
      flex: 1;
      min-width: 45%; 
      padding: 1rem; /* Added padding to make separation clearer */
      border: 1px solid #2a2a30; /* Added a subtle border for separation */
      border-radius: 8px;
  }

  .chart-title {
      font-size: 1.2rem;
      color: #f97316;
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 600;
  }

  .vertical-bar-chart-grid {
      display: grid;
      grid-template-columns: 50px 1fr; /* Y-axis width and Bars container */
      height: 300px;
      position: relative;
      border-bottom: 1px solid #555; /* X-axis line */
  }

  /* Y-Axis Styling */
  .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding-bottom: 0.2rem; 
      font-size: 0.8rem;
      color: #a1a1aa;
      text-align: right;
  }

  .y-tick {
      position: relative;
  }

  /* Grid lines are now only visible in the macro group */
  .macro-group .y-grid-line {
      position: absolute;
      top: 50%;
      right: 0;
      width: 100vw; 
      height: 1px;
      background-color: #2a2a30;
      z-index: 0;
  }

  /* Hide grid lines for the Energy chart */
  .calories-group .y-tick .y-grid-line {
      display: none;
  }

  /* Bars Container */
  .bars-container {
      display: flex;
      justify-content: space-around;
      gap: 1.5rem;
      padding-top: 1px; 
  }

  .bar-set-container {
      width: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end; 
  }
  
  .bar-set {
      display: flex;
      height: 100%;
      align-items: flex-end;
      gap: 4px;
      width: 100%;
      justify-content: center;
      position: relative;
      padding-bottom: 20px; 
  }

  .vertical-bar {
      width: 25px;
      min-height: 1px; 
      transition: height 0.5s ease-out;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      position: relative;
      cursor: pointer;
  }

  /* Bar color assignments: Dark = Recommended, Light = Consumed */
  
  /* Energy Group (Red) */
  .calories-group .recommended-bar { background-color: var(--red-dark); }
  .calories-group .consumed-bar { background-color: var(--red-light); }
  
  /* Macronutrient group (Green) */
  .macro-group .recommended-bar { background-color: var(--green-dark); } 
  .macro-group .consumed-bar { background-color: var(--green-light); } 


  /* X-Axis Labels */
  .x-axis-label {
      text-align: center;
      font-size: 0.9rem;
      color: #fff;
      margin-top: 5px;
      width: 100%;
  }

  /* Tooltip for hover effect */
  .vertical-bar::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%; 
      left: 50%;
      transform: translateX(-50%) translateY(-5px);
      background-color: #333;
      color: #fff;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
      z-index: 10;
      pointer-events: none; 
  }

  .vertical-bar:hover::after {
      opacity: 1;
      visibility: visible;
  }
`;
