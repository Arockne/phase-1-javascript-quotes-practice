function getQuotes() {
  fetch('http://localhost:3000/quotes?_embed=likes')
  .then(resp => resp.json())
  .then(renderQuotes);
}

function renderQuotes(quotes) {
  quotes.forEach(createQuote);
}

function createQuote(quote) {
  const p = document.createElement('p');
  p.className = 'mb-0';
  p.textContent = quote.quote;
  
  const footer = document.createElement('footer');
  footer.className = 'blockquote-footer';
  footer.textContent = quote.author;
  
  const br = document.createElement('br');
  
  const success = document.createElement('button');
  success.className = 'btn-success';
  success.textContent = 'Likes: '
  success.addEventListener('click', updateLikes);
  
  const likes = document.createElement('span');
  likes.textContent = quote.likes.length;
  success.appendChild(likes);
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-danger';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', deleteQuote);
  
  const block = document.createElement('blockquote');
  block.append(p, footer, br, success, deleteBtn);
  
  const li = document.createElement('li');
  li.className = 'quote-card';
  li.id = quote.id;
  li.appendChild(block);
  
  document.querySelector('#quote-list').appendChild(li);
}

function saveNewQuote() {
  const form =  document.querySelector('#new-quote-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const quote = form.querySelector('#new-quote').value;
    const author = form.querySelector('#author').value;
    addNewQuote({author, quote})
    form.reset();
  })
} 

function addNewQuote(quoteObj) {
  const {author, quote} = quoteObj;
  if (!author && !quote) return;
  fetch('http://localhost:3000/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quoteObj)
  })
  .then(resp => resp.json())
  .then(createQuote);
}

function deleteQuote(e) {
  const quote = e.target.parentNode.parentNode;
  quote.remove()
  fetch(`http://localhost:3000/quotes/${quote.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(resp => console.log(resp));
}

function updateLikes(e) {
  const id = Number(this.parentNode.parentNode.id);
  const likes = this.querySelector('span');
  likes.textContent = Number(likes.textContent) + 1;

  const likeObject = {
    quoteId: id,
    createdAt: Date.now()
  }

  addLikes(likeObject);
}

function addLikes(likeObject) {
  fetch('http://localhost:3000/likes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(likeObject)
  })
}

function init() {
  getQuotes();
  saveNewQuote();
}

init();