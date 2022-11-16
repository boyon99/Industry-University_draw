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