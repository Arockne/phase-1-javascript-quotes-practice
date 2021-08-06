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

  const edit = document.createElement('button');
  edit.textContent = 'Edit';
  edit.addEventListener('click', editQuote);
  
  const block = document.createElement('blockquote');
  block.append(p, footer, br, success, deleteBtn, edit);
  
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

  saveLikes(likeObject);
}

function saveLikes(likeObject) {
  fetch('http://localhost:3000/likes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(likeObject)
  })
}

function editQuote() {
  const quoteElement = this.parentNode.querySelector('.mb-0');
  const quote = quoteElement.textContent;
  const authorElement = this.parentNode.querySelector('footer');
  const author = authorElement.textContent;
  
  const formElements = `
      <label for="edit-quote">Quote</label>
      <input name="quote" type="text" id="edit-quote" value="${quote}">
      <br>
      <label for="edit-author">Author</label>
      <input name="author" type="text" id="edit-author" value="${author}">
      <input type="submit" value="Edit Quote">
  `
  const form = document.createElement('form');
  form.innerHTML = formElements;
  form.addEventListener('submit', handleEdit);
  
  //Hides elements for edit
  quoteElement.style.display = 'none';
  authorElement.style.display = 'none';
  this.style.display = 'none';
  this.parentNode.insertBefore(form, this.parentNode.children[3])
}

function handleEdit(e) {
  e.preventDefault();
  const quoteEdit = this.querySelector('#edit-quote').value;
  const authorEdit = this.querySelector('#edit-author').value;
  const id = this.parentNode.parentNode.id;

  saveEdit({
    quote: quoteEdit, 
    author: authorEdit, 
    id: id
  });
  
  //Quote edit inserts
  const quote = this.parentNode.querySelector('.mb-0');
  quote.textContent = quoteEdit;
  const author = this.parentNode.querySelector('footer');
  author.textContent = authorEdit;
  
  //reverts all hidden quote elements
  const displayNone = this.parentNode.querySelectorAll('[style]');
  displayNone.forEach(e => e.style.display = 'revert');
  this.remove();
}

function saveEdit({quote, author, id}) {
  fetch(`http://localhost:3000/quotes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({quote, author})
  })
  .then(resp => console.log(resp));
}

function init() {
  getQuotes();
  saveNewQuote();
}

init();