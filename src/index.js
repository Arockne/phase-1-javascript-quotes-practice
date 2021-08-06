function getQuotes() {
  fetch('http://localhost:3000/quotes?_embed=likes')
  .then(resp => resp.json())
  .then(renderQuotes);
}

function renderQuotes(quotes) {
  quotes.forEach(createQuote);
  const sortButton = document.createElement('button');
  sortButton.textContent = 'Sort By Name: Off';
  document.querySelector('h1').insertAdjacentElement('afterend', sortButton);
  
  const copy = []
  quotes.forEach(quote => {
    const copyObj = Object.assign({}, quote);
    copy.push(copyObj);
  })
  const sortedQuotes = copy.sort(sortByName);
  
  let sorted = false;
  sortButton.addEventListener('click', () => {
    console.log(sorted);
    const quoteList = document.querySelector('#quote-list').querySelectorAll('li');
    quoteList.forEach(quote => quote.remove());
    if (!sorted) {
      sorted = true;
      sortButton.textContent = 'Sort By Name: On';
      sortedQuotes.forEach(createQuote);
    } else if (sorted) {
      sorted = false;
      sortButton.textContent = 'Sort By Name: off';
      quotes.forEach(createQuote);
    }
  })
}

function sortByName(a, b) {
  const authorA = a.author.toUpperCase();
  const authorB = b.author.toUpperCase();
  if (authorA < authorB) {
    return -1;
  }
  if (authorA > authorB) {
    return 1;
  }
  return 0;
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
  likes.textContent = quote.likes ? quote.likes.length : 0;
  console.log(likes.textContent);
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
  
  const form = createQuoteEditForm(quote, author);
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

function createQuoteEditForm(quote, author) {
  const labelForQuote = document.createElement('label');
  labelForQuote.setAttribute('for', 'edit-quote');
  labelForQuote.textContent = 'Quote';

  const quoteEdit = document.createElement('input');
  quoteEdit.setAttribute('name', 'quote');
  quoteEdit.setAttribute('type', 'text');
  quoteEdit.id = 'edit-quote';
  quoteEdit.value = quote;

  const br = document.createElement('br');

  const labelForAuthor = document.createElement('label');
  labelForAuthor.setAttribute('for', 'edit-author');
  labelForAuthor.textContent = 'Author';

  const authorEdit = document.createElement('input');
  authorEdit.setAttribute('name', 'author');
  authorEdit.setAttribute('type', 'text');
  authorEdit.id = 'edit-author';
  authorEdit.value = author;

  const submit = document.createElement('input');
  submit.setAttribute('type', 'submit');
  submit.value = 'Edit Quote';
  
  const form = document.createElement('form');
  form.append(labelForQuote, quoteEdit, br, labelForAuthor, authorEdit, submit);
  return form;
}

function init() {
  getQuotes();
  saveNewQuote();
}

init();