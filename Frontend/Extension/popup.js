document.addEventListener('DOMContentLoaded', restoreScreenshotsAndNotes);

document.getElementById('screenshotBtn').addEventListener('click', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage({ action: 'takeScreenshot', tabId: tabs[0].id }, (response) => {
      if (response.error) {
        console.error(response.error);
        alert(response.error); // Show error alert if screenshot fails
      } else {
        addScreenshotToPopup(response.screenshotUrl, response.time);
        saveScreenshotToLocalStorage(response.screenshotUrl, response.time);
      }
    });
  });
});

document.getElementById('addNoteBtn').addEventListener('click', async () => {
  const note = document.getElementById('noteInput').value;

  if (!note) {
    alert('Please enter a note.');
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage({ action: 'addNote', note: note, tabId: tabs[0].id }, (response) => {
      if (response.error) {
        console.error(response.error);
        alert(response.error); // Show error alert if adding note fails
      } else {
        addNoteToPopup(response.note, response.time);
        saveNoteToLocalStorage(response.note, response.time);
      }
    });
  });

  document.getElementById('noteInput').value = ''; // Clear input field after adding the note
});

document.getElementById('clearBtn').addEventListener('click', clearAllScreenshotsAndNotes);
document.getElementById('saveBtn').addEventListener('click', saveAsPDF);

// Function to add a screenshot to the popup in real-time
function addScreenshotToPopup(screenshotUrl, time) {
  const screenshotNoteContainer = document.getElementById('screenshotNoteContainer');

  const div = document.createElement('div');
  div.classList.add('screenshot-note');

  const img = document.createElement('img');
  img.src = screenshotUrl;
  img.classList.add('screenshot');
  div.appendChild(img);

  const timestamp = document.createElement('p');
  timestamp.classList.add('timestamp');
  timestamp.textContent = `Time: ${time.toFixed(2)} seconds`;
  div.appendChild(timestamp);

  screenshotNoteContainer.appendChild(div);
}

// Function to add a note to the popup in real-time
function addNoteToPopup(note, time) {
  const screenshotNoteContainer = document.getElementById('screenshotNoteContainer');

  const div = document.createElement('div');
  div.classList.add('screenshot-note');

  const noteElement = document.createElement('p');
  noteElement.classList.add('note');
  noteElement.textContent = note;
  div.appendChild(noteElement);

  const timestamp = document.createElement('p');
  timestamp.classList.add('timestamp');
  timestamp.textContent = `Time: ${time.toFixed(2)} seconds`;
  div.appendChild(timestamp);

  screenshotNoteContainer.appendChild(div);
}

// Save screenshot and note to localStorage
function saveScreenshotToLocalStorage(screenshotUrl, time) {
  let savedScreenshots = JSON.parse(localStorage.getItem('screenshots')) || [];
  savedScreenshots.push({ screenshotUrl, time });
  localStorage.setItem('screenshots', JSON.stringify(savedScreenshots));
}

function saveNoteToLocalStorage(note, time) {
  let savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
  savedNotes.push({ note, time });
  localStorage.setItem('notes', JSON.stringify(savedNotes));
}

// Restore screenshots and notes from localStorage when popup is opened
function restoreScreenshotsAndNotes() {
  const savedScreenshots = JSON.parse(localStorage.getItem('screenshots')) || [];
  const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];

  savedScreenshots.forEach((screenshot) => {
    addScreenshotToPopup(screenshot.screenshotUrl, screenshot.time);
  });

  savedNotes.forEach((note) => {
    addNoteToPopup(note.note, note.time);
  });
}

// Clear all screenshots and notes
function clearAllScreenshotsAndNotes() {
  // Clear the popup
  document.getElementById('screenshotNoteContainer').innerHTML = '';

  // Clear from localStorage
  localStorage.removeItem('screenshots');
  localStorage.removeItem('notes');
}

// Save screenshots and notes as PDF using jsPDF
async function saveAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const videoTitle = tabs[0].title;
    const videoUrl = tabs[0].url;
    let y = 10; // Start position in the PDF for text
    const pageHeight = 270; // Define the page height threshold for better page breaks

    // Add the video title at the top and make it clickable
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255);
    doc.textWithLink(videoTitle, 10, y, { url: videoUrl });
    y += 10;

    const savedScreenshots = JSON.parse(localStorage.getItem('screenshots')) || [];
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];

    // Combine screenshots and notes into a single array and sort by timestamp
    const combinedContent = [];

    savedScreenshots.forEach((screenshot) => {
      combinedContent.push({ type: 'screenshot', data: screenshot });
    });

    savedNotes.forEach((note) => {
      combinedContent.push({ type: 'note', data: note });
    });

    // Sort combined content by timestamp
    combinedContent.sort((a, b) => a.data.time - b.data.time);

    // Process each item (note or screenshot) in the combined content using async/await
    for (const [index, item] of combinedContent.entries()) {
      if (item.type === 'note') {
        const noteText = `Note ${index + 1}: ${item.data.note}`;
        const noteLines = doc.splitTextToSize(noteText, 180); // Split the note text to fit within the page width
        
        // Check if the note fits in the remaining space, else add a new page
        if (y + noteLines.length * 10 + 10 > pageHeight) {
          doc.addPage();
          y = 10; // Reset y for the new page
        }
        
        // Adding the note to the PDF
        doc.text(noteLines, 10, y);
        y += noteLines.length * 10;

        // Add clickable timestamp link for the note at the end
        doc.setTextColor(0, 0, 255);
        doc.textWithLink(`${item.data.time.toFixed(2)} seconds`, 10, y, {
          url: `${videoUrl}&t=${Math.floor(item.data.time)}s`
        });
        doc.setTextColor(0, 0, 0); // Reset text color
        y += 10;

      } else if (item.type === 'screenshot') {
        const screenshotText = `Screenshot ${index + 1}`;
        
        // Check if the screenshot and timestamp fit in the remaining space, else add a new page
        if (y + 110 + 10 > pageHeight) { // 110 for the image and 10 for the timestamp
          doc.addPage();
          y = 10; // Reset y for the new page
        }
        
        // Add screenshot text and clickable timestamp after the image
        doc.text(screenshotText, 10, y);
        y += 10;

        // Convert the screenshot image URL to base64 and await until it's added to the PDF
        await new Promise((resolve) => {
          convertImageToDataUrl(item.data.screenshotUrl, (dataUrl) => {
            doc.addImage(dataUrl, 'JPEG', 10, y, 180, 100); // Adjust size and position as needed
            y += 110;

            // Add clickable timestamp link for the screenshot at the end
            doc.setTextColor(0, 0, 255);
            doc.textWithLink(`${item.data.time.toFixed(2)} seconds`, 10, y, {
              url: `${videoUrl}&t=${Math.floor(item.data.time)}s`
            });
            doc.setTextColor(0, 0, 0); // Reset text color
            y += 10;

            resolve();
          });
        });
      }

      // Add a new page if necessary
      if (y > pageHeight) {
        doc.addPage();
        y = 10; // Reset y for the new page
      }
    }

    // Once all screenshots are processed, save the PDF
    const fileName = `${videoTitle}.pdf`;
    doc.save(fileName);
  });
}



// Utility function to convert image URL to Data URL
function convertImageToDataUrl(url, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    callback(dataUrl);
  };
}
