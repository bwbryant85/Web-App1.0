/* ════════════ LIBRARY ════════════ */
function initLibrary98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;';

  const menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">View</div><div class="win-menu-item">Help</div>';
  c.appendChild(menu);

  const wrap = document.createElement('div');
  wrap.style.cssText = 'flex:1;display:flex;gap:10px;padding:10px;overflow:hidden;';
  c.appendChild(wrap);

  const books = [
    {
      id: 'alice',
      title: 'Alice in Wonderland',
      author: 'Lewis Carroll',
      desc: 'A magical journey through a whimsical world.',
      content: `CHAPTER I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank...`
    },
    {
      id: 'sherlock',
      title: 'Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      desc: 'Classic detective tales from the Baker Street investigator.',
      content: `Chapter I. Mr. Sherlock Holmes

In the year 1878 I took my degree of Doctor of Medicine...`
    },
    {
      id: 'pride',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      desc: 'A timeless novel about love, society, and manners.',
      content: `Chapter 1

It is a truth universally acknowledged, that a single man in possession...`
    },
    {
      id: 'oz',
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      desc: 'A girl travels to a colorful land after a tornado strikes.',
      content: `Chapter 1. The Cyclone

Dorothy lived in the midst of the great Kansas prairie...`
    }
  ];

  let currentBook = null;
  let filteredBooks = books.slice();

  const left = document.createElement('div');
  left.style.cssText = 'width:280px;display:flex;flex-direction:column;gap:10px;overflow:hidden;';

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search books';
  search.style.cssText = 'width:100%;padding:8px 10px;border:2px inset #808080;background:#f0f0f0;font-family:var(--pixel-font);font-size:14px;';
  left.appendChild(search);

  const list = document.createElement('div');
  list.style.cssText = 'flex:1;overflow-y:auto;padding-right:4px;';
  left.appendChild(list);

  const right = document.createElement('div');
  right.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:10px;overflow:hidden;';

  const readerHeader = document.createElement('div');
  readerHeader.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:#e0e0e0;border:2px inset #808080;font-family:var(--pixel-font);';
  readerHeader.innerHTML = `<div><div style="font-size:16px;font-weight:bold;color:#111;">Library</div><div style="font-size:12px;color:#333;">Browse and read free books.</div></div><button class="btn98">Clear</button>`;
  right.appendChild(readerHeader);

  const readerBody = document.createElement('div');
  readerBody.style.cssText = 'flex:1;overflow-y:auto;padding:14px;background:#fff;border:2px solid #808080;white-space:pre-wrap;font-family:var(--pixel-font);font-size:14px;line-height:1.5;color:#111;';
  readerBody.textContent = 'Select a book from the left to start reading.';
  right.appendChild(readerBody);

  wrap.appendChild(left);
  wrap.appendChild(right);

  function renderBooks() {
    list.innerHTML = '';
    if (!filteredBooks.length) {
      list.innerHTML = '<div style="padding:14px;font-family:var(--pixel-font);font-size:14px;color:#666;">No books match your search.</div>';
      return;
    }
    filteredBooks.forEach(book => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:10px 12px;margin-bottom:8px;background:#fff;border:2px solid #808080;cursor:pointer;font-family:var(--pixel-font);';
      item.innerHTML = `<div style="font-weight:bold;color:#111;">${book.title}</div><div style="font-size:11px;color:#333;margin:4px 0;">${book.author}</div><div style="font-size:12px;color:#444;">${book.desc}</div>`;
      item.addEventListener('click', () => selectBook(book));
      list.appendChild(item);
    });
  }

  function selectBook(book) {
    currentBook = book;
    readerHeader.querySelector('button').textContent = 'Back';
    readerHeader.querySelector('div').innerHTML = `<div style="font-size:16px;font-weight:bold;color:#111;">${book.title}</div><div style="font-size:12px;color:#333;">by ${book.author}</div>`;
    readerBody.textContent = book.content;
  }

  function clearSelection() {
    currentBook = null;
    readerHeader.querySelector('button').textContent = 'Clear';
    readerHeader.querySelector('div').innerHTML = '<div style="font-size:16px;font-weight:bold;color:#111;">Library</div><div style="font-size:12px;color:#333;">Browse and read free books.</div>';
    readerBody.textContent = 'Select a book from the left to start reading.';
  }

  function onSearch() {
    const term = search.value.trim().toLowerCase();
    filteredBooks = books.filter(book => book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term) || book.desc.toLowerCase().includes(term));
    renderBooks();
  }

  const clearBtn = readerHeader.querySelector('button');
  const onClearClick = () => {
    if (currentBook) clearSelection();
    else { search.value = ''; onSearch(); }
  };

  search.addEventListener('input', onSearch);
  clearBtn.addEventListener('click', onClearClick);

  renderBooks();

  return () => {
    search.removeEventListener('input', onSearch);
    clearBtn.removeEventListener('click', onClearClick);
  };
}
