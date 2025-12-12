// Editable selects + other inputs + localStorage persistence

// Elements
const targetBranch = document.getElementById('targetBranch');
const addBranchBtn = document.getElementById('addBranchBtn');
const branchList = document.getElementById('branchList');

const repoSelect = document.getElementById('repoSelect');
const addRepoBtn = document.getElementById('addRepoBtn');
const repoList = document.getElementById('repoList');

const form = document.getElementById('gitForm');
const resetBtn = document.getElementById('resetBtn');

// Local storage keys
const BRANCH_KEY = 'git_ui_branchOptions_v1';
const REPO_KEY = 'git_ui_repoOptions_v1';

// Defaults
let branchOptions = JSON.parse(localStorage.getItem(BRANCH_KEY) || 'null');
if (!Array.isArray(branchOptions) || branchOptions.length === 0) branchOptions = ['dev','stage','main'];

let repoOptions = JSON.parse(localStorage.getItem(REPO_KEY) || 'null');
if (!Array.isArray(repoOptions) || repoOptions.length === 0) repoOptions = ['current','repo-a','repo-b'];

// Helpers
function saveBranches(){ localStorage.setItem(BRANCH_KEY, JSON.stringify(branchOptions)); }
function saveRepos(){ localStorage.setItem(REPO_KEY, JSON.stringify(repoOptions)); }

function renderEditable(selectEl, listEl, items, type){
  // select
  selectEl.innerHTML = '';
  items.forEach(it => {
    const o = document.createElement('option');
    o.value = it; o.textContent = it;
    selectEl.appendChild(o);
  });

  // list (with delete on left)
  listEl.innerHTML = '';
  items.forEach(it => {
    const li = document.createElement('li');

    // left delete button
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'del-left';
    del.dataset.type = type;
    del.dataset.val = it;
    del.textContent = '-';
    del.title = 'Sil';

    const span = document.createElement('span');
    span.textContent = it;

    li.appendChild(del);
    li.appendChild(span);

    listEl.appendChild(li);
  });
}

// Initial render
renderEditable(targetBranch, branchList, branchOptions, 'branch');
renderEditable(repoSelect, repoList, repoOptions, 'repo');

// Add handlers
addBranchBtn.addEventListener('click', () => {
  const newVal = prompt('Yeni branch adı:');
  if(!newVal) return;
  const val = newVal.trim();
  if(!val) return;
  if(branchOptions.includes(val)) return alert('Bu seçenek zaten mevcut.');
  branchOptions.push(val);
  saveBranches();
  renderEditable(targetBranch, branchList, branchOptions, 'branch');
});

addRepoBtn.addEventListener('click', () => {
  const newVal = prompt('Yeni repo adı:');
  if(!newVal) return;
  const val = newVal.trim();
  if(!val) return;
  if(repoOptions.includes(val)) return alert('Bu seçenek zaten mevcut.');
  repoOptions.push(val);
  saveRepos();
  renderEditable(repoSelect, repoList, repoOptions, 'repo');
});

// Delegated delete (left button)
document.addEventListener('click', (e) => {
  const el = e.target;
  if(!el.classList.contains('del-left')) return;
  const val = el.dataset.val;
  const type = el.dataset.type;
  if(!val || !type) return;
  if(!confirm(`${val} seçeneğini silmek istediğinize emin misiniz?`)) return;

  if(type === 'branch'){
    branchOptions = branchOptions.filter(x => x !== val);
    saveBranches();
    renderEditable(targetBranch, branchList, branchOptions, 'branch');
  } else {
    repoOptions = repoOptions.filter(x => x !== val);
    saveRepos();
    renderEditable(repoSelect, repoList, repoOptions, 'repo');
  }
});


// Form submit example (prevent default, show payload)
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const payload = {
    targetBranch: targetBranch.value || null,
    issueNumber: document.getElementById('issueNumber').value || null,
    branchName: document.getElementById('branchName').value || null,
    commitMessage: document.getElementById('commitMessage').value || null,
    repo: repoSelect.value || null
  };
  console.log('PR payload:', payload);
  alert('Payload konsola yazıldı.');
});
