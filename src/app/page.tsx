import Link from 'next/link'

export default function Home() {
  return (
    <div style={{background:'#03070F',minHeight:'100vh',fontFamily:'Inter,sans-serif',color:'#E2EEF8'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#03070F;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M40 0H0v1h40V0zM0 40h40v-1H0v1zM0 0v40h1V0H0zM39 0v40h1V0h-1z' fill='rgba(0,200,232,0.04)'/%3E%3C/svg%3E")}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-16px) rotate(-2deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,200,232,0.2)}50%{box-shadow:0 0 50px rgba(0,200,232,0.5)}}
        .pulse{animation:pulse 2s ease-in-out infinite}
        .float{animation:float 3.5s ease-in-out infinite}
        .glow{animation:glow 3s ease-in-out infinite}
        a{text-decoration:none}
        .card{background:#101E35;border:1px solid rgba(0,200,232,0.12);border-radius:14px;transition:all 0.25s}
        .card:hover{border-color:rgba(0,200,232,0.35);transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.3)}
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(3,7,15,0.85)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,200,232,0.1)',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#00C8E8,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'15px',color:'#03070F',fontFamily:'Space Grotesk,sans-serif'}}>F</div>
          <span style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'19px',color:'#E2EEF8'}}>FormForge</span>
        </Link>
        <div style={{display:'flex',alignItems:'center',gap:'36px'}}>
          <Link href="#how-it-works" style={{color:'#6B8FAF',fontSize:'14px',transition:'color 0.2s'}}>How it works</Link>
          <Link href="#pricing" style={{color:'#6B8FAF',fontSize:'14px'}}>Pricing</Link>
          <Link href="/dashboard/new" style={{background:'linear-gradient(135deg,#00C8E8,#0088FF)',color:'#03070F',fontWeight:700,padding:'10px 22px',borderRadius:'8px',fontSize:'14px',fontFamily:'Space Grotesk,sans-serif'}}>Try free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 24px 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'1000px',height:'600px',background:'radial-gradient(ellipse at center top,rgba(0,200,232,0.1) 0%,transparent 65%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',top:'30%',right:'5%',width:'600px',height:'600px',background:'radial-gradient(ellipse,rgba(139,92,246,0.07) 0%,transparent 65%)',pointerEvents:'none'}} />

        <div style={{position:'relative',maxWidth:'820px',width:'100%'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',border:'1px solid rgba(0,200,232,0.22)',borderRadius:'999px',padding:'7px 20px',marginBottom:'40px'}}>
            <span className="pulse" style={{width:'7px',height:'7px',borderRadius:'50%',background:'#10D98C',display:'inline-block'}} />
            <span style={{color:'#6B8FAF',fontSize:'13px',fontFamily:'monospace',letterSpacing:'0.06em'}}>Powered by Claude AI · Vision + Reasoning</span>
          </div>

          <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:'clamp(56px,9vw,96px)',lineHeight:1.02,letterSpacing:'-3px',color:'#E2EEF8',marginBottom:'0'}}>
            From flat to form.
          </h1>
          <h1 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:'clamp(56px,9vw,96px)',lineHeight:1.02,letterSpacing:'-3px',color:'#00C8E8',marginBottom:'36px',textShadow:'0 0 60px rgba(0,200,232,0.35)'}}>
            Instantly.
          </h1>

          <p style={{color:'#6B8FAF',fontSize:'20px',maxWidth:'560px',margin:'0 auto 48px',lineHeight:1.75}}>
            Upload any 2D PDF engineering drawing and get a full interactive 3D model with DXF, OBJ, and GLTF export in under 2 minutes.
          </p>

          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'16px',flexWrap:'wrap',marginBottom:'24px'}}>
            <Link href="/dashboard/new" className="glow" style={{background:'linear-gradient(135deg,#00C8E8,#0088FF)',color:'#03070F',fontWeight:700,padding:'17px 40px',borderRadius:'10px',fontSize:'17px',fontFamily:'Space Grotesk,sans-serif',display:'inline-block'}}>
              Convert a drawing free →
            </Link>
            <Link href="#how-it-works" style={{border:'1px solid rgba(0,200,232,0.25)',color:'#E2EEF8',padding:'16px 32px',borderRadius:'10px',fontSize:'16px',fontWeight:500,display:'inline-block'}}>
              See how it works ↓
            </Link>
          </div>

          <p style={{color:'#344B63',fontSize:'13px',fontFamily:'monospace',letterSpacing:'0.03em'}}>
            No account needed · Architectural · Mechanical · Civil · Structural
          </p>

          {/* Hero visual */}
          <div style={{marginTop:'80px',display:'flex',alignItems:'center',justifyContent:'center',gap:'48px'}}>
            <div style={{border:'1px solid rgba(0,200,232,0.25)',borderRadius:'14px',background:'rgba(0,200,232,0.04)',padding:'36px 44px',textAlign:'center',fontFamily:'monospace',color:'#6B8FAF'}}>
              <div style={{fontSize:'40px',marginBottom:'10px'}}>📐</div>
              <div style={{fontSize:'12px',letterSpacing:'0.12em',textTransform:'uppercase'}}>2D PDF Drawing</div>
              <div style={{fontSize:'11px',marginTop:'4px',color:'#344B63'}}>Architectural · Mechanical</div>
            </div>

            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'6px'}}>
              <div style={{width:'80px',height:'1px',background:'linear-gradient(90deg,rgba(0,200,232,0.1),#00C8E8)'}} />
              <span style={{color:'#00C8E8',fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.15em',padding:'4px 10px',border:'1px solid rgba(0,200,232,0.2)',borderRadius:'4px',background:'rgba(0,200,232,0.05)'}}>AI</span>
              <div style={{width:'80px',height:'1px',background:'linear-gradient(90deg,#00C8E8,rgba(0,200,232,0.1))'}} />
            </div>

            <div className="float" style={{border:'1.5px solid #00C8E8',borderRadius:'14px',background:'rgba(0,200,232,0.07)',padding:'36px 44px',textAlign:'center',fontFamily:'monospace',color:'#00C8E8',fontWeight:600,boxShadow:'0 0 50px rgba(0,200,232,0.18)'}}>
              <div style={{fontSize:'40px',marginBottom:'10px'}}>🏗️</div>
              <div style={{fontSize:'12px',letterSpacing:'0.12em',textTransform:'uppercase'}}>3D Model + CAD</div>
              <div style={{fontSize:'11px',marginTop:'4px',color:'rgba(0,200,232,0.6)'}}>DXF · OBJ · GLTF</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{padding:'100px 24px',maxWidth:'1100px',margin:'0 auto'}}>
        <p style={{fontFamily:'monospace',fontSize:'11px',letterSpacing:'0.2em',textTransform:'uppercase',color:'#00C8E8',textAlign:'center',marginBottom:'14px'}}>The pipeline</p>
        <h2 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:'clamp(34px,4vw,52px)',letterSpacing:'-1.5px',color:'#E2EEF8',textAlign:'center',marginBottom:'70px'}}>Four steps. Two minutes.</h2>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:'20px'}}>
          {([
            {icon:'⬆',num:'01',title:'Upload PDF',body:'Drop your 2D drawing. We handle architectural, mechanical, structural, and civil PDFs up to 50MB.'},
            {icon:'🔍',num:'02',title:'AI Parses',body:'Claude Vision reads every line, dimension, wall type, room label, and annotation in your drawing.'},
            {icon:'🧊',num:'03',title:'3D Generated',body:'Walls, rooms, columns, glazing, and furniture are extruded into a full interactive 3D model.'},
            {icon:'⬇',num:'04',title:'Download CAD',body:'DXF for AutoCAD, OBJ for Blender, GLTF for web viewers. Professional quality output.'},
          ] as {icon:string,num:string,title:string,body:string}[]).map((s) => (
            <div key={s.num} className="card" style={{padding:'32px 26px',textAlign:'center'}}>
              <div style={{width:'54px',height:'54px',borderRadius:'50%',border:'1px solid rgba(0,200,232,0.3)',background:'rgba(0,200,232,0.06)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:'24px'}}>
                {s.icon}
              </div>
              <p style={{fontFamily:'monospace',fontSize:'11px',color:'#344B63',marginBottom:'10px',letterSpacing:'0.1em'}}>{s.num}</p>
              <h3 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'18px',color:'#E2EEF8',marginBottom:'12px'}}>{s.title}</h3>
              <p style={{color:'#6B8FAF',fontSize:'14px',lineHeight:1.7}}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORMATS */}
      <section style={{padding:'0 24px 100px',maxWidth:'900px',margin:'0 auto'}}>
        <div className="card" style={{padding:'48px 52px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'48px'}}>
          <div>
            <p style={{fontFamily:'monospace',fontSize:'11px',letterSpacing:'0.15em',textTransform:'uppercase',color:'#00C8E8',marginBottom:'24px'}}>What you upload</p>
            <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
              <div style={{width:'54px',height:'54px',borderRadius:'10px',background:'rgba(0,200,232,0.08)',border:'1px solid rgba(0,200,232,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'14px',color:'#00C8E8',fontFamily:'monospace',flexShrink:0}}>PDF</div>
              <div>
                <p style={{fontSize:'16px',fontWeight:500,color:'#E2EEF8'}}>PDF Files</p>
                <p style={{fontSize:'13px',color:'#6B8FAF',marginTop:'3px'}}>Architectural · Mechanical · Civil · Structural</p>
              </div>
            </div>
          </div>
          <div>
            <p style={{fontFamily:'monospace',fontSize:'11px',letterSpacing:'0.15em',textTransform:'uppercase',color:'#00C8E8',marginBottom:'24px'}}>What you get</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginBottom:'14px'}}>
              {['DXF','OBJ','GLTF','PNG'].map(f => (
                <span key={f} style={{border:'1px solid rgba(0,200,232,0.2)',color:'#00C8E8',fontFamily:'monospace',fontSize:'13px',fontWeight:600,padding:'8px 18px',borderRadius:'8px',background:'rgba(0,200,232,0.05)'}}>{f}</span>
              ))}
            </div>
            <p style={{color:'#6B8FAF',fontSize:'13px'}}>AutoCAD · Blender · Unity · Revit · Three.js</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:'100px 24px',maxWidth:'1000px',margin:'0 auto'}}>
        <p style={{fontFamily:'monospace',fontSize:'11px',letterSpacing:'0.2em',textTransform:'uppercase',color:'#00C8E8',textAlign:'center',marginBottom:'14px'}}>Credits</p>
        <h2 style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:'clamp(34px,4vw,52px)',letterSpacing:'-1.5px',color:'#E2EEF8',textAlign:'center',marginBottom:'12px'}}>Simple, transparent pricing</h2>
        <p style={{color:'#6B8FAF',textAlign:'center',marginBottom:'64px',fontFamily:'monospace',fontSize:'14px'}}>1 credit = 1 PDF page processed</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:'24px',maxWidth:'900px',margin:'0 auto'}}>
          {([
            {name:'Starter',      credits:5,   price:9,  featured:false, desc:'For occasional use'},
            {name:'Professional', credits:20,  price:25, featured:true,  desc:'Most popular choice'},
            {name:'Studio',       credits:100, price:79, featured:false, desc:'For teams and studios'},
          ] as {name:string,credits:number,price:number,featured:boolean,desc:string}[]).map((p) => (
            <div key={p.name} className="card" style={{padding:'40px 32px',display:'flex',flexDirection:'column',gap:'22px',position:'relative',..( p.featured ? {borderColor:'rgba(0,200,232,0.45)',boxShadow:'0 0 60px rgba(0,200,232,0.1)'} : {})}}>
              {p.featured && (
                <div style={{position:'absolute',top:'-14px',left:'50%',transform:'translateX(-50%)',background:'#00C8E8',color:'#03070F',fontWeight:700,fontSize:'11px',letterSpacing:'0.1em',padding:'4px 16px',borderRadius:'999px',fontFamily:'Space Grotesk,sans-serif',whiteSpace:'nowrap'}}>
                  MOST POPULAR
                </div>
              )}
              <div>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,fontSize:'20px',color:'#E2EEF8'}}>{p.name}</p>
                <p style={{fontSize:'13px',color:'#6B8FAF',marginTop:'3px'}}>{p.desc}</p>
              </div>
              <div>
                <span style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:700,fontSize:'60px',color:'#E2EEF8',letterSpacing:'-2px',lineHeight:1}}>${p.price}</span>
              </div>
              <p style={{fontFamily:'monospace',fontSize:'16px',color:'#00C8E8',fontWeight:600}}>{p.credits} credits</p>
              <Link href="/dashboard/credits" style={{background: p.featured ? 'linear-gradient(135deg,#00C8E8,#0088FF)' : 'transparent',color: p.featured ? '#03070F' : '#E2EEF8',fontWeight:700,padding:'15px',borderRadius:'10px',fontSize:'15px',textAlign:'center',display:'block',border: p.featured ? 'none' : '1px solid rgba(0,200,232,0.25)',fontFamily:'Space Grotesk,sans-serif'}}>
                Get started
              </Link>
            </div>
          ))}
        </div>
        <p style={{color:'#344B63',textAlign:'center',fontSize:'13px',marginTop:'28px',fontFamily:'monospace'}}>
          Or try free — no account needed · First 3 jobs free (1 page each)
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(0,200,232,0.08)',padding:'48px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'24px',maxWidth:'1100px',margin:'0 auto'}}>
        <div>
          <p style={{fontFamily:'Space Grotesk,sans-serif',fontWeight:600,color:'#E2EEF8'}}>FormForge</p>
          <p style={{color:'#6B8FAF',fontSize:'13px',marginTop:'4px'}}>PDF to 3D CAD — powered by Claude AI</p>
        </div>
        <div style={{display:'flex',gap:'32px'}}>
          <Link href="/privacy" style={{color:'#6B8FAF',fontSize:'14px'}}>Privacy</Link>
          <Link href="/terms"   style={{color:'#6B8FAF',fontSize:'14px'}}>Terms</Link>
          <a href="mailto:hello@formforge.io" style={{color:'#6B8FAF',fontSize:'14px'}}>Contact</a>
        </div>
        <p style={{color:'#344B63',fontSize:'13px'}}>© 2025 FormForge. All rights reserved.</p>
      </footer>
    </div>
  )
}
