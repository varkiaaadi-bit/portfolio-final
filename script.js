document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const target=document.querySelector(link.getAttribute('href'));
    if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'});}
  });
});
const reveal = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');reveal.unobserve(entry.target);}});
},{threshold:.12});
document.querySelectorAll('.section,.project-feature,.skill-grid article,.timeline-item,.extra article').forEach(el=>{el.classList.add('reveal');reveal.observe(el);});
