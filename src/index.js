function getQuotes() {
  fetch('http://localhost:3000/quotes?_embed=likes')
  .then(resp => resp.json())
  .then(renderQuotes);
}


//structure
  //id
    //number
  //quote
    //string
  //author
    //string
  //likes --> array of objects //assuming the length of this is the amount of likes
    //id
    //quotedId
      //assuming this is referencing the same id within quote
    //createAt

function renderQuotes(quotes) {
  quotes.forEach(quote => {
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

    const likes = document.createElement('span');
    likes.textContent = quote.likes.length;
    success.appendChild(likes);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-danger';
    deleteBtn.textContent = 'Delete';

    const block = document.createElement('blockquote');
    block.append(p, footer, br, success, deleteBtn);

    const li = document.createElement('li');
    li.className = 'quote-card';
    li.appendChild(block);

    document.querySelector('#quote-list').appendChild(li);
  })
}

function init() {
  getQuotes();
}

init();