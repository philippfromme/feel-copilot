export function addLogEntry(logEntry) {
  return fetch('/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(logEntry)
  })
    .then(response => response.json())
    .catch(error => console.error(error));
}

export function updateLogEntryRating(id, rating) {
  return fetch(`/api/log/${ id }/update-rating`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rating
    })
  })
    .then(response => response.json())
    .catch(error => console.error(error));
}

export function updateLogEntryFeedback(id, feedback) {
  return fetch(`/api/log/${ id }/update-feedback`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      feedback
    })
  })
    .then(response => response.json())
    .catch(error => console.error(error));
}