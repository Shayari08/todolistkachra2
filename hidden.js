// hidden.js

document.addEventListener('DOMContentLoaded', function() {
  const hiddenTaskList = document.getElementById('hiddenTaskList');

  // Load hidden tasks from storage
  function loadHiddenTasks() {
    chrome.storage.local.get(['hiddenTasks'], function(result) {
      const hiddenTasks = result.hiddenTasks || [];
      hiddenTasks.forEach(task => {
        const div = createHiddenTaskElement(task);
        hiddenTaskList.appendChild(div);
      });
    });
  }

  // Create hidden task element
  function createHiddenTaskElement(task) {
    const div = document.createElement('div');
    div.classList.add('task-item');

    // Task text
    const span = document.createElement('span');
    span.textContent = task;
    span.style.textAlign = 'left';

    // Restore button for individual task
    const restoreButton = document.createElement('button');
    restoreButton.className = 'restore-button';
    restoreButton.textContent = 'Restore';
    restoreButton.addEventListener('click', function () {
      div.remove(); // Remove the task element from the hidden tasks list
      removeHiddenTask(task); // Remove the task from hidden storage
      addTaskToStorage(task); // Add the task back to main storage
    });

    // Append elements to task div
    div.appendChild(span);
    div.appendChild(restoreButton);

    return div;
  }

  // Load hidden tasks on page load
  loadHiddenTasks();

  // Restore all tasks button click handler
  document.getElementById('restoreAllButton').addEventListener('click', function() {
    chrome.storage.local.get(['hiddenTasks'], function(result) {
      const hiddenTasks = result.hiddenTasks || [];
      chrome.storage.local.get(['tasks'], function(data) {
        const tasks = data.tasks || [];
        // Move all hidden tasks back to main tasks storage
        tasks.push(...hiddenTasks);
        chrome.storage.local.set({ tasks });
        // Clear hidden tasks storage
        chrome.storage.local.remove('hiddenTasks');
        // Reload the main popup page to reflect restored tasks
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'reloadTasks' });
        });
        // Optionally, clear the hidden tasks list in the UI
        hiddenTaskList.innerHTML = '';
      });
    });
  });

  // Remove hidden task from storage
  function removeHiddenTask(task) {
    chrome.storage.local.get(['hiddenTasks'], function (data) {
      let hiddenTasks = data.hiddenTasks || [];
      hiddenTasks = hiddenTasks.filter(t => t !== task);
      chrome.storage.local.set({ hiddenTasks });
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

  // Back button click handler
  document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'popup.html';
  });
});
