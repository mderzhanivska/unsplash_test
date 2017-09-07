const filterCheckboxes = document.querySelectorAll('.rounded input[type="checkbox"]'); // finds all checkboxes on page
const listPhotos = document.querySelector('.list-photos'); // finds list
const listAuthors = document.getElementById('authors'); // finds list
const paginations = document.getElementById('paginations');
const modal = document.getElementById('modal');


(() => {

	const countOfPhotos = 20; // 10 <=> 30
	const urlAPI = 'https://api.unsplash.com/photos/';
	const clientId = '244e45a4077ae10f757d7c9eaf5d66b70c4daa310df270f51ac314f552867de8';

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = (e) => {
		(e.target == modal) && closeModal();
		return true;
	}

	const closeModalBtn = modal.querySelector('.close');
	if (closeModalBtn) {
		closeModalBtn.onclick = closeModal;
	}

	//function divides list oof photos by size, returns size
	const sizePhoto = (width) => {
		let size = '';
		if (width >= 1500) {
  		size = 'large';
  	} else if (width >= 800) {
  		size = 'medium';
  	} else if (width >= 0) {
  		size = 'small';	
  	}
		return size;
	}

	var curPhotos;

	function request(url) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.send();

		xhr.onreadystatechange = function(response) {
		  if (xhr.readyState != 4) return;

		  if (xhr.status != 200) {
		    alert(xhr.status + ': ' + xhr.statusText);
		  } else {
			  const responsePhotos = JSON.parse(xhr.responseText);
			  curPhoto = responsePhotos;

				createAuthors(responsePhotos);
				changeFilter();
				pagination(xhr.getResponseHeader('link'));
		  }

		}
	}

	// Create checkboxes for authors
	function createAuthors(photos) {
		const authors = {};
		var strDom = '';

		photos.forEach(photo => {
			if (!authors[photo.user.name]) {
				authors[photo.user.name] = photo.user.name;
				strDom += `<li class="rounded">
										<label>
											<input type="checkbox" checked="checked" name='${photo.user.name}' checked>
											${photo.user.name}
										</label>
									</li>`;
			}
		});

		listAuthors.innerHTML = strDom;
		listAuthors.querySelectorAll('input').forEach(dom => dom.onchange = changeFilter);
	}

	// filters photos by size
	function changeFilter() {

		const filters = {};
		const authors = {};
		filterCheckboxes.forEach(dom => filters[dom.name] = dom.checked);
		listAuthors.querySelectorAll('input').forEach(dom => authors[dom.name] = dom.checked);

		var strDom = '';

		curPhoto.forEach(photo => {
			if (filters[sizePhoto(photo.width)] && authors[photo.user.name]) {
				strDom += `<li data-id="${photo.id}">
						<div 
							class="image-container" 
							data-url="${photo.urls.full}"
							data-likes="${photo.likes}"
							data-author-url="${photo.user.links.html}"
							data-author-name="${photo.user.name}"
							data-author-photo="${photo.user.profile_image.small}"
						>
							<img src="${photo.urls.thumb}" alt="${(photo.description) ? photo.description : ''}">
							<div class="info">
								<span class="likes">Likes: ${photo.likes}</span>
								<a class="download" href="${photo.links.download}" download>Download</a>
								<a class="author" href="${photo.user.links.html}"><img src="${photo.user.profile_image.small}">${photo.user.name}</a>
							</div>
						</div>
					</li>`;
			}
		});

		listPhotos.innerHTML = strDom;
		listPhotos.querySelectorAll('.image-container').forEach(dom => dom.onclick = openModal);
	}


	function openModal() {
		modal.classList.add('active');

		const author = modal.querySelector('.author');
		author.href = this.dataset.authorUrl;
		author.querySelector('img').src = this.dataset.authorPhoto;
		author.querySelector('span').textContent = this.dataset.authorName;

		modal.querySelector('.modal-body > img').src = this.dataset.url;
		modal.querySelector('.likes span').textContent = this.dataset.likes;
	}

	function closeModal() {
		modal.classList.remove('active')
	}


	function pagination(list) {
		const pages = [];
		const pagination = {};
		const regex = /<([\S]*)>[\W]*rel="([\w]*)/g;
		var match;

		while ((match = regex.exec(list)) !== null) {
			const [_, url, rel] = match;

			pagination[rel] = {
				url: url,
				rel: rel
			}
		}

		(pagination.first) &&	pages.push(pagination.first);
		(pagination.prev) && pages.push(pagination.prev);
		(pagination.next) && pages.push(pagination.next);
		(pagination.last) && pages.push(pagination.last);

		var strDom = '';
		for (var page of pages) {
			strDom += `<li><a href="${page.url}">${page.rel}</a><li>`;
		}

		paginations.innerHTML = strDom;
		paginations.querySelectorAll('a').forEach(dom => dom.click = e => {
			e.preventDefault;
			request(`${this.href}&client_id=${clientId}`);
		});
	}

	filterCheckboxes.forEach(dom => dom.onchange = changeFilter);
	request(`${urlAPI}?client_id=${clientId}&per_page=${countOfPhotos}`);
})();


