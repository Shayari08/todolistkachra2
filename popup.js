document.addEventListener('DOMContentLoaded', function () {
  const taskList = document.getElementById('task-list');
  const newTaskInput = document.getElementById('new-task');
  const hiddenButton = document.getElementById('hiddenButton');
  const archiveButton = document.getElementById('archiveButton'); // Added archiveButton

  // Load tasks from storage
  function loadTasks() {
    chrome.storage.local.get(['tasks', 'completedTasks'], function (data) {
      const tasks = data.tasks || [];
      const completedTasks = data.completedTasks || [];
      tasks.forEach(task => {
        const div = createTaskElement(task, false);
        taskList.appendChild(div);
      });
    });
  }

  // Save tasks to storage
  function saveTasks(tasks) {
    chrome.storage.local.set({ tasks });
  }

  // Save hidden tasks to storage
  function saveHiddenTasks(hiddenTasks) {
    chrome.storage.local.set({ hiddenTasks });
  }

  // Save archived tasks to storage
  function saveArchiveTasks(archiveTasks) {
    chrome.storage.local.set({ archiveTasks });
  }
  function addCompletedTask(task) {
      chrome.storage.local.get(['completedTasks'], function (data) {
        const completedTasks = data.completedTasks || [];
        if (!completedTasks.includes(task)) {
          completedTasks.push(task);
          chrome.storage.local.set({ completedTasks });
        }
      });
    } 
  // Create task element
  function createTaskElement(task, isHidden) {
    const div = document.createElement('div');
    div.classList.add('task-item');

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        span.style.textDecoration = 'line-through';
        span.style.opacity = '0.5';
        div.classList.add('completed');
        addCompletedTask(task);
      } else {
        span.style.textDecoration = 'none';
        span.style.opacity = '1';
        div.classList.remove('completed');
        removeCompletedTask(task);
      }
      updateTaskList();
    });
    // Function to add completed task
    


    // Task text
    const span = document.createElement('span');
    span.textContent = task;
    span.style.textAlign = 'left';

    // Double-click to delete
    div.addEventListener('dblclick', function () {
      div.remove(); // Remove the task element from the DOM
      removeTask(task); // Remove the task from storage
    });

    // Hide/Unhide button
    const hideButton = document.createElement('button');
    hideButton.className = 'move-button';
    hideButton.textContent = isHidden ? 'Unhide' : 'Hide';
    hideButton.addEventListener('click', function () {
      div.remove(); // Remove the task element from the DOM
      if (checkbox.checked) {
        if (isHidden) {
          removeHiddenTask(task); // Remove the task from hidden storage
          addTaskToStorage(task); // Add the task to main storage
        } else {
          removeTask(task); // Remove the task from main storage
          addTaskToArchive(task); // Add the task to archived storage
        }
      } else {
        if (isHidden) {
          removeHiddenTask(task); // Remove the task from hidden storage
          addTaskToStorage(task); // Add the task to main storage
        } else {
          removeTask(task); // Remove the task from main storage
          addTaskToHidden(task); // Add the task to hidden storage
        }
      }
    });

    // Append elements to task div
    const taskContent = document.createElement('div');
    taskContent.style.display = 'flex';
    taskContent.style.alignItems = 'center';
    taskContent.appendChild(checkbox);
    taskContent.appendChild(span);
    taskContent.appendChild(hideButton);

    div.appendChild(taskContent);

    return div;
  }

  // Update tasks in storage
  function updateTaskList() {
    saveTasks(getTasksFromList());
  }

  // Retrieve tasks from DOM
  function getTasksFromList() {
    return Array.from(taskList.children).map(div => div.querySelector('span').textContent);
  }

  // Remove task from storage
  function removeTask(task) {
    chrome.storage.local.get(['tasks'], function (data) {
      let tasks = data.tasks || [];
      tasks = tasks.filter(t => t !== task);
      saveTasks(tasks);
    });
  }

  // Remove hidden task from storage
  function removeHiddenTask(task) {
    chrome.storage.local.get(['hiddenTasks'], function (data) {
      let hiddenTasks = data.hiddenTasks || [];
      hiddenTasks = hiddenTasks.filter(t => t !== task);
      saveHiddenTasks(hiddenTasks);
    });
  }

  // Remove archived task from storage
  function removeArchivedTask(task) {
    chrome.storage.local.get(['archiveTasks'], function (data) {
      let archiveTasks = data.archiveTasks || [];
      archiveTasks = archiveTasks.filter(t => t !== task);
      saveArchiveTasks(archiveTasks);
    });
  }

  // Add task to hidden storage
  function addTaskToHidden(task) {
    chrome.storage.local.get(['hiddenTasks'], function (data) {
      const hiddenTasks = data.hiddenTasks || [];
      hiddenTasks.push(task);
      saveHiddenTasks(hiddenTasks);
    });
  }

  // Add task to archived storage
  function addTaskToArchive(task) {
    chrome.storage.local.get(['archiveTasks'], function (data) {
      const archiveTasks = data.archiveTasks || [];
      archiveTasks.push(task);
      saveArchiveTasks(archiveTasks);
    });
  }

  // Add task to main storage
  function addTaskToStorage(task) {
    chrome.storage.local.get(['tasks'], function (data) {
      const tasks = data.tasks || [];
      tasks.push(task);
      saveTasks(tasks);
    });
  }

  // Handle new task input
  newTaskInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      const newTask = newTaskInput.value.trim();
      if (newTask !== '' && newTask !== null) {
        chrome.storage.local.get(['tasks'], function (data) {
          const tasks = data.tasks || [];
          tasks.push(newTask);
          saveTasks(tasks);
          const div = createTaskElement(newTask, false);
          taskList.appendChild(div);
        });
        newTaskInput.value = '';
      } else {
        alert('Task cannot be empty!');
      }
    }
  });

  // Show hidden tasks button functionality
  hiddenButton.addEventListener('click', function () {
    window.location.href = 'hidden.html';
  });

  // Show archived tasks button functionality
  archiveButton.addEventListener('click', function () {
    window.location.href = 'archive.html';
  });

  loadTasks(); // Load tasks on page load
});
