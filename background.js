// background.js

// Function to move completed tasks to archive
function moveCompletedTasksToArchive() {
  chrome.storage.local.get(['tasks', 'archivedTasks'], function (data) {
    let tasks = data.tasks || [];
    let archivedTasks = data.archivedTasks || [];

    // Filter completed tasks
    const completedTasks = tasks.filter(task => {
      return task.completed; // Assuming tasks have a 'completed' property
    });

    // Move completed tasks to archive
    completedTasks.forEach(task => {
      archivedTasks.push(task);
    });

    // Remove completed tasks from main tasks
    tasks = tasks.filter(task => !task.completed);

    // Update storage
    chrome.storage.local.set({ tasks, archivedTasks }, function() {
      console.log('Completed tasks moved to archive.');
    });
  });
}

// Set interval to execute the function at 1:30 AM daily
function setTimerToMoveTasks() {
  const now = new Date();
  let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 30, 0); // 1:30 AM today

  // If current time is past 1:30 AM, set timer for 1:30 AM next day
  if (now.getHours() >= 1 || (now.getHours() === 1 && now.getMinutes() >= 18)) {
    tomorrow = new Date(tomorrow.setDate(tomorrow.getDate() + 1));
  }

  const timeUntil130AM = tomorrow - now;

  setTimeout(function() {
    moveCompletedTasksToArchive();
    setInterval(moveCompletedTasksToArchive, 24 * 60 * 60 * 1000); // Repeat every 24 hours
  }, timeUntil130AM);
}

// Start the timer when extension is installed or updated
chrome.runtime.onInstalled.addListener(function() {
  setTimerToMoveTasks();
});
