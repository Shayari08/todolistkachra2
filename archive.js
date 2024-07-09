document.addEventListener('DOMContentLoaded', function() {
    const archivedTaskList = document.getElementById('archivedTaskList');
    const backButton = document.getElementById('backButton'); // Corrected backButton variable
  
    // Load archived tasks from storage
    function loadArchivedTasks() {
      chrome.storage.local.get(['archiveTasks'], function(result) {
        const archiveTasks = result.archiveTasks || []; // Corrected variable name
        archiveTasks.forEach(task => {
          const div = createArchivedTaskElement(task);
          archivedTaskList.appendChild(div);
        });
      });
    }
  
    // Create archived task element
    function createArchivedTaskElement(task) {
      const div = document.createElement('div');
      div.classList.add('task-item');
  
      // Task text
      const span = document.createElement('span');
      span.textContent = task;
      span.style.textAlign = 'left';
  
      // Restore button
      const restoreButton = document.createElement('button');
      restoreButton.className = 'restore-button';
      restoreButton.textContent = 'Restore';
      restoreButton.addEventListener('click', function () {
        div.remove(); // Remove the task element from the archived tasks list
        removeArchivedTask(task); // Remove the task from archived storage
        addTaskToStorage(task); // Add the task back to main storage
      });
  
      // Append elements to task div
      div.appendChild(span);
      div.appendChild(restoreButton);
  
      return div;
    }
  
    // Remove archived task from storage
    function removeArchivedTask(task) {
      chrome.storage.local.get(['archiveTasks'], function (data) {
        let archiveTasks = data.archiveTasks || [];
        archiveTasks = archiveTasks.filter(t => t !== task);
        chrome.storage.local.set({ archiveTasks });
      });
    }
  
    // Add task back to main storage
    function addTaskToStorage(task) {
      chrome.storage.local.get(['tasks'], function (data) {
        const tasks = data.tasks || [];
        tasks.push(task);
        chrome.storage.local.set({ tasks });
      });
    }
  
    // Restore tasks button click handler
    backButton.addEventListener('click', function () {
      // Reload the main popup page to reflect restored tasks
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'reloadTasks' });
      });
  
      // Optionally, you can clear the archived tasks list in the UI
      archivedTaskList.innerHTML = '';
    });
    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = 'popup.html';
      });
  
    loadArchivedTasks(); // Load archived tasks on page load
  });
  