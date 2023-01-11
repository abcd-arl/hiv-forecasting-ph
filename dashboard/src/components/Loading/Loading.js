export default function Loading() {
	return (
		<div className="absolute top-[50%] left-[50%] h-5 color-[#6b6b6b] z-50">
			<div
				className="bg-[#6b6b6b] w-1 h-5 rounded-sm relative inline-block animate-bounce-middle-main 
			before:content-['']
			before:block before:w-1 before:h-5 before:rounded-sm before:bg-[#6b6b6b]  
			before:absolute before:left-[-6px] before:top-[50%] 
			before:transform before:translate-y-[-10px] before:translate-z-[0] before:animate-bounce-middle-before 
			after:content-['']
			after:block after:w-1 after:h-5 after:rounded-sm after:bg-[#6b6b6b] 
			after:absolute after:left-[6px] after:top-[50%] 
			after:transform after:translate-y-[-10px] after:translate-z-[0] after:animate-bounce-middle-after"
			></div>
		</div>
	);
}
