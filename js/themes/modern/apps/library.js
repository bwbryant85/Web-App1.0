/* ════════════ LIBRARY v8 MODERN ════════════ */
function initLibrary98() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  const header = document.createElement('div');
  header.style.cssText = 'padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;';
  header.innerHTML = `<div><div style="font-family:'Inter',sans-serif;font-size:1.5rem;font-weight:700;color:#111;">Library</div><div style="font-family:'Inter',sans-serif;font-size:.95rem;color:#555;margin-top:4px;">Browse free public domain books and read them in-app.</div></div><button style="font-family:'Inter',sans-serif;font-size:.95rem;color:#111;background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:16px;padding:10px 16px;cursor:pointer;">Clear</button>`;
  c.appendChild(header);

  const container = document.createElement('div');
  container.style.cssText = 'flex:1;display:grid;grid-template-columns:320px 1fr;gap:16px;padding:0 24px 24px 24px;overflow:hidden;';
  c.appendChild(container);

  const books = [
    {
      id: 'alice',
      title: 'Alice’s Adventures in Wonderland',
      author: 'Lewis Carroll',
      desc: 'A playful adventure through a curious world.',
      content: `CHAPTER I. Down the Rabbit-Hole\n\nAlice was beginning to get very tired of sitting by her sister on the bank...`
    },
    {
      id: 'sherlock',
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      desc: 'Detective mysteries from Baker Street.',
      content: `Chapter I. Mr. Sherlock Holmes\n\nIn the year 1878 I took my degree of Doctor of Medicine...`
    },
    {
      id: 'pride',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      desc: 'A story of manners, romance, and society.',
      content: `Chapter 1\n\nIt is a truth universally acknowledged, that a single man in possession...`
    },
    {
      id: 'oz',
      title: 'The Wonderful Wizard of Oz',
      author: 'L. Frank Baum',
      desc: 'A girl swept away to a magical land.',
      content: `Chapter 1. The Cyclone\n\nDorothy lived in the midst of the great Kansas prairie...`
    }
  ];

  let currentBook = null;
  let filteredBooks = books.slice();

  const left = document.createElement('div');
  left.style.cssText = 'display:flex;flex-direction:column;gap:14px;overflow:hidden;';

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search books';
  search.style.cssText = 'width:100%;padding:14px 16px;border-radius:18px;border:1px solid rgba(15,23,42,.12);background:#fff;font-family:\'Inter\',sans-serif;font-size:1rem;color:#111;outline:none;';
  left.appendChild(search);

  const list = document.createElement('div');
  list.style.cssText = 'flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding-right:4px;';
  left.appendChild(list);

  const right = document.createElement('div');
  right.style.cssText = 'display:flex;flex-direction:column;gap:14px;overflow:hidden;';

  const readerHeader = document.createElement('div');
  readerHeader.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px;background:rgba(255,255,255,.76);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(15,23,42,.08);border-radius:24px;';
  readerHeader.innerHTML = `<div><div style="font-family:'Inter',sans-serif;font-size:1.1rem;font-weight:700;color:#111;">Library</div><div style="font-family:'Inter',sans-serif;font-size:.9rem;color:#555;margin-top:4px;">Select a book to begin reading.</div></div><button style="font-family:'Inter',sans-serif;font-size:.95rem;color:#111;background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:16px;padding:10px 16px;cursor:pointer;">Clear</button>`;
  right.appendChild(readerHeader);

  const readerBody = document.createElement('div');
  readerBody.style.cssText = 'flex:1;overflow-y:auto;padding:24px;background:rgba(255,255,255,.82);border:1px solid rgba(15,23,42,.08);border-radius:24px;white-space:pre-wrap;font-family:\'Inter\',sans-serif;font-size:1rem;line-height:1.7;color:#111;';
  readerBody.textContent = 'Select a book from the list to start reading.';
  right.appendChild(readerBody);

  container.appendChild(left);
  container.appendChild(right);

  function renderBooks() {
    list.innerHTML = '';
    if (!filteredBooks.length) {
      list.innerHTML = '<div style="padding:18px;font-family:\'Inter\',sans-serif;font-size:1rem;color:#666;">No books match your search.</div>';
      return;
    }
    filteredBooks.forEach(book => {
      const item = document.createElement('button');
      item.style.cssText = 'text-align:left;padding:18px;border:none;border-radius:22px;background:rgba(255,255,255,.8);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);cursor:pointer;box-shadow:0 14px 32px rgba(15,23,42,.08);transition:transform .2s ease;';
      item.onmouseover = () => item.style.transform = 'scale(1.01)';
      item.onmouseout = () => item.style.transform = 'scale(1)';
      item.innerHTML = `<div style="font-family:'Inter',sans-serif;font-size:1rem;font-weight:700;color:#111;">${book.title}</div><div style="font-family:'Inter',sans-serif;font-size:.9rem;color:#555;margin-top:6px;">${book.author}</div><div style="font-family:'Inter',sans-serif;font-size:.85rem;color:#666;margin-top:10px;">${book.desc}</div>`;
      item.addEventListener('click', () => selectBook(book));
      list.appendChild(item);
    });
  }

  function selectBook(book) {
    currentBook = book;
    readerHeader.querySelector('button').textContent = 'Back';
    readerHeader.querySelector('div').innerHTML = `<div style="font-family:'Inter',sans-serif;font-size:1.1rem;font-weight:700;color:#111;">${book.title}</div><div style="font-family:'Inter',sans-serif;font-size:.9rem;color:#555;margin-top:4px;">by ${book.author}</div>`;
    readerBody.textContent = book.content;
  }

  function clearSelection() {
    currentBook = null;
    readerHeader.querySelector('button').textContent = 'Clear';
    readerHeader.querySelector('div').innerHTML = '<div style="font-family:\'Inter\',sans-serif;font-size:1.1rem;font-weight:700;color:#111;">Library</div><div style="font-family:\'Inter\',sans-serif;font-size:.9rem;color:#555;margin-top:4px;">Select a book to begin reading.</div>';
    readerBody.textContent = 'Select a book from the list to start reading.';
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
