const tabMenus = document.querySelectorAll('.tab_menu li');
const tabContents = document.querySelectorAll('.content section');
const peopleRe = document.querySelector('.people_re');
// 탭메뉴
const activeSection = (e) => {
    e.stopPropagation();

    let menuIndex = [...tabMenus].indexOf(e.target);

    tabMenus.forEach(menu => {
        [...tabMenus].indexOf(menu) === menuIndex
            ? menu.classList.add('active')
            : menu.classList.remove('active')
    });

    tabContents.forEach(content => {
        [...tabContents].indexOf(content) === menuIndex
            ? content.classList.add('active')
            : content.classList.remove('active')
    });
    // 정보 > 수정하기 탭 메뉴 이동 시 숨김
    if(menuIndex==0){
        peopleRe.style.display="flex";
    }
    else{
        peopleRe.style.display="none";  
    }
}

[...tabMenus][0].classList.add('active');
[...tabContents][0].classList.add('active');

tabMenus.forEach(menu => {
    menu.addEventListener('click', activeSection)
})

// 설정 > 공유링크 > 링크복사
function linkCopy(){
    var copyText = document.getElementById('copy_text');
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("Copy");
    alert('공유 링크가 성공적으로 복사되었습니다.');
  
}

// 갤러리 > 이미지 슬라이드
const gallery = document.querySelectorAll(".wrapper_gallery .image");
const previewBox = document.querySelector(".preview_box");
const closeIcon = document.querySelector("#icon");
const previewImg = previewBox.querySelector("img");

window.onload = ()=>{
    for(let i=0; i < gallery.length; i++){
        let newIndex = i;
        gallery[i].onclick = ()=>{
            let clickImgIndex = newIndex;
            console.log(i);
            function preview(){
                let selectedImgUrl = gallery[newIndex].querySelector("img").src;            
                previewImg.src = selectedImgUrl;
                closeIcon.style.display="block";
            }

            // 이전 다음 버튼 기능
            const prevBtn = document.querySelector(".prev");
            const nextBtn = document.querySelector(".next");
            if(newIndex==0){
                prevBtn.style.display="none";
            }
            else if(newIndex >=gallery.length-1){
                nextBtn.style.display="none";
            }
            prevBtn.onclick = ()=>{
                newIndex--;
                if(newIndex==0){
                    prevBtn.style.display="none";
                    preview();
                }
                else{
                    preview();
                    nextBtn.style.display="block";
                }
            }
            nextBtn.onclick = ()=>{
                newIndex++;
                if(newIndex >= gallery.length-1){
                    nextBtn.style.display="none";
                    preview();
                }
                else{
                    preview();
                    prevBtn.style.display="block";
                }
            }

            preview();
            previewBox.classList.add("show");

            // 닫기 기능
            closeIcon.onclick = ()=>{
                newIndex = clickImgIndex;
                prevBtn.style.display="block";
                nextBtn.style.display="block";
                previewBox.classList.remove("show");
                closeIcon.style.display="none";
            }
        }
    }
    closeIcon.style.display="none";
}