import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  return (
    <div style={{background:'#03070F',minHeight:'100vh',fontFamily:'Inter,sans-serif',color:'#E2EEF8'}}>
      
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(3,7,15,.85)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,200,232,.1)',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#00C8E8,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,color:'#03070F',fontFamily:'Space Grotesk'}}>F</div>
          <span style={{fontFamily:'Space Grotesk',fontWeight:600,fontSize:19}}>FormForge</span>
        </Link>
        <div style={{display:'flex',alignItems:'center',gap:36}}>
          <Link href="#how" style={{color:'#6B8FAF',fontSize:14}}>How it works</Link>
          <Link href="#pricing" style={{color:'#6B8FAF',fontSize:14}}>Pricing</Link>
          <Link href="/dashboard/new" style={{background:'linear-gradient(135deg,#00C8E8,#0088FF)',color:'#03070F',fontWeight:700,padding:'10px 22px',borderRadius:8,fontSize:14,fontFamily:'Space Grotesk'}}>Try free</Link>
        </div>
      </nav>

      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 24px 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:1000,height:600,background:'radial-gradient(ellipse at center top,rgba(0,200,232,.1) 0%,transparent 65%)',pointerEvents:'none'}} />
        <div style={{position:'relative',maxWidth:820,width:'100%'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,border:'1px solid rgba(0,200,232,.22)',borderRadius:999,padding:'7px 20px',marginBottom:40}}>
            <span className="pls" style={{width:7,height:7,borderRadius:'50%',background:'#10D98C',display:'inline-block'}} />
            <span style={{color:'#6B8FAF',fontSize:13,fontFamily:'monospace'}}>Powered by Claude AI</span>
          </div>
          <h1 style={{fontFamily:'Space Grotesk',fontWeight:700,fontSize:'clamp(56px,9vw,96px)',lineHeight:1.02,letterSpacing:'-3px'}}>From flat to form.</h1>
          <h1 style={{fontFamily:'Space Grotesk',fontWeight:700,fontSize:'clamp(56px,9vw,96px)',lineHeight:1.02,letterSpacing:'-3px',color:'#00C8E8',marginBottom:36,textShadow:'0 0 60px rgba(0,200,232,.35)'}}>Instantly.</h1>
          <p style={{color:'#6B8FAF',fontSize:20,maxWidth:560,margin:'0 auto 48px',lineHeight:1.75}}>Upload any 2D PDF engineering drawing and get a full interactive 3D model with DXF, OBJ, and GLTF export in under 2 minutes.</p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,flexWrap:'wrap',marginBottom:24}}>
            <Link href="/dashboard/new" className="glw" style={{background:'linear-gradient(135deg,#00C8E8,#0088FF)',color:'#03070F',fontWeight:700,padding:'17px 40px',borderRadius:10,fontSize:17,fontFamily:'Space Grotesk',display:'inline-block'}}>Convert a drawing free →</Link>
            <Link href="#how" style={{border:'1px solid rgba(0,200,232,.25)',color:'#E2EEF8',padding:'16px 32px',borderRadius:10,fontSize:16,fontWeight:500,display:'inline-block'}}>See how it works ↓</Link>
          </div>
          <p style={{color:'#344B63',fontSize:13,fontFamily:'monospace'}}>No account needed · Architectural · Mechanical · Civil</p>
          <div style={{marginTop:80,display:'flex',alignItems:'center',justifyContent:'center',gap:48,flexWrap:'wrap'}}>
            <div style={{border:'1px solid rgba(0,200,232,.25)',borderRadius:14,background:'rgba(0,200,232,.04)',padding:'36px 44px',textAlign:'center',fontFamily:'monospace',color:'#6B8FAF'}}>
              <div style={{fontSize:40,marginBottom:10}}>📐</div>
              <div style={{fontSize:12,letterSpacing:'.12em',textTransform:'uppercase'}}>2D PDF Drawing</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <span style={{color:'#00C8E8',fontSize:10,fontFamily:'monospace',letterSpacing:'.15em',padding:'4px 10px',border:'1px solid rgba(0,200,232,.2)',borderRadius:4,background:'rgba(0,200,232,.05)'}}>AI</span>
            </div>
            <div className="flt" style={{border:'1.5px solid #00C8E8',borderRadius:14,background:'rgba(0,200,232,.07)',padding:'36px 44px',textAlign:'center',fontFamily:'monospace',color:'#00C8E8',fontWeight:600,boxShadow:'0 0 50px rgba(0,200,232,.18)'}}>
              <div style={{fontSize:40,marginBottom:10}}>🏗️</div>
              <div style={{fontSize:12,letterSpacing:'.12em',textTransform:'uppercase'}}>3D Model + CAD</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={{padding:'100px 24px',maxWidth:1100,margin:'0 auto'}}>
        <p style={{fontFamily:'monospace',fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:'#00C8E8',textAlign:'center',marginBottom:14}}>The pipeline</p>
        <h2 style={{fontFamily:'Space Grotesk',fontWeight:700,fontSize:'clamp(34px,4vw,52px)',letterSpacing:'-1.5px',textAlign:'center',marginBottom:70}}>Four steps. Two minutes.</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:20}}>
          {[['⬆','01','Upload PDF','Drop your 2D drawing. Architectural, mechanical, structural, and civil PDFs up to 50MB.'],['🔍','02','AI Parses','Claude Vision reads every line, dimension, wall type, and room label in your drawing.'],['🧊','03','3D Generated','Walls, rooms, columns, and furniture are extruded into a full interactive 3D model.'],['⬇','04','Download CAD','DXF for AutoCAD, OBJ for Blender, GLTF for web. Professional quality output.']].map((s)=>(
            <div key={s[1]} className="cd" style={{padding:'32px 26px',textAlign:'center'}}>
              <div style={{width:54,height:54,borderRadius:'50%',border:'1px solid rgba(0,200,232,.3)',background:'rgba(0,200,232,.06)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:24}}>{s[0]}</div>
              <p style={{fontFamily:'monospace',fontSize:11,color:'#344B63',marginBottom:10}}>{s[1]}</p>
              <h3 style={{fontFamily:'Space Grotesk',fontWeight:600,fontSize:18,marginBottom:12}}>{s[2]}</h3>
              <p style={{color:'#6B8FAF',fontSize:14,lineHeight:1.7}}>{s[3]}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" style={{padding:'100px 24px',maxWidth:1000,margin:'0 auto'}}>
        <p style={{fontFamily:'monospace',fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:'#00C8E8',textAlign:'center',marginBottom:14}}>Credits</p>
        <h2 style={{fontFamily:'Space Grotesk',fontWeight:700,fontSize:'clamp(34px,4vw,52px)',letterSpacing:'-1.5px',textAlign:'center',marginBottom:12}}>Simple, transparent pricing</h2>
        <p style={{color:'#6B8FAF',textAlign:'center',marginBottom:64,fontFamily:'monospace',fontSize:14}}>1 credit = 1 PDF page processed</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:24,maxWidth:900,margin:'0 auto'}}>
          {[['Starter','5','9','no','For occasional use'],['Professional','20','25','yes','Most popular choice'],['Studio','100','79','no','For teams and studios']].map((p)=>(
            <div key={p[0]} className="cd" style={{padding:'40px 32px',display:'flex',flexDirection:'column',gap:22,position:'relative',borderColor:p[3]==='yes'?'rgba(0,200,232,.45)':'rgba(0,200,232,.12)',boxShadow:p[3]==='yes'?'0 0 60px rgba(0,200,232,.1)':'none'}}>
              {p[3]==='yes'&&<div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'#00C8E8',color:'#03070F',fontWeight:700,fontSize:11,letterSpacing:'.1em',padding:'4px 16px',borderRadius:999,fontFamily:'Space Grotesk',whiteSpace:'nowrap'}}>MOST POPULAR</div>}
              <div>
                <p style={{fontFamily:'Space Grotesk',fontWeight:600,fontSize:20}}>{p[0]}</p>
                <p style={{fontSize:13,color:'#6B8FAF',marginTop:3}}>{p[4]}</p>
              </div>
              <span style={{fontFamily:'Space Grotesk',fontWeight:700,fontSize:60,letterSpacing:'-2px',lineHeight:1}}>${p[2]}</span>
              <p style={{fontFamily:'monospace',fontSize:16,color:'#00C8E8',fontWeight:600}}>{p[1]} credits</p>
              <Link href="/dashboard/credits" style={{background:p[3]==='yes'?'linear-gradient(135deg,#00C8E8,#0088FF)':'transparent',color:p[3]==='yes'?'#03070F':'#E2EEF8',fontWeight:700,padding:15,borderRadius:10,fontSize:15,textAlign:'center',display:'block',border:p[3]==='yes'?'none':'1px solid rgba(0,200,232,.25)',fontFamily:'Space Grotesk'}}>Get started</Link>
            </div>
          ))}
        </div>
      </section>

      <footer style={{borderTop:'1px solid rgba(0,200,232,.08)',padding:48,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:24,maxWidth:1100,margin:'0 auto'}}>
        <div>
          <p style={{fontFamily:'Space Grotesk',fontWeight:600}}>FormForge</p>
          <p style={{color:'#6B8FAF',fontSize:13,marginTop:4}}>PDF to 3D CAD — powered by Claude AI</p>
        </div>
        <p style={{color:'#344B63',fontSize:13}}>© 2025 FormForge. All rights reserved.</p>
      </footer>
    </div>
  )
}
