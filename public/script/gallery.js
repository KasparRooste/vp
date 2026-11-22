window.onload = function(){
    let allThumbs = document.querySelector("#gallery").querySelectorAll(".thumbs");
    for(let i = 0;i < allThumbs.lentght; i ++){
        allThumbs[i].addEventListener("click", openModal);
    }
}

function openModal(e){
    document.querySelector("#modalImage").src = "/gallery/normal/" + e.target.dataset
        .filename;
    document.querySelector("#modaleCaption").innerHTML = e.target.alt;
    document.querySelector("#modal").showModal();
}

function closeModal(){
    document.querySelector("#modal").close();
    document.querySelector("#modalImage").src = "../pic/empty.png";
    document.querySelector("#modalCaption").innerHTML = "galeriipilt";
}