import Layout from '../components/Layout';

export default function Budget() {
  return (
    <Layout title="Budget" subtitle="Budget allocation and planning">
      <div style={{
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:420,textAlign:'center'
      }}>
        <div style={{width:80,height:80,borderRadius:20,background:'rgba(139,92,246,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,marginBottom:22,boxShadow:'0 0 32px rgba(139,92,246,0.2)'}}>◉</div>
        <h2 style={{fontSize:26,fontWeight:700,color:'var(--text-primary)',marginBottom:8}}>Budget</h2>
        <p style={{fontSize:14,color:'var(--text-secondary)',marginBottom:20}}>Budget module is under construction.</p>
        <span style={{background:'rgba(139,92,246,0.15)',color:'#8b5cf6',padding:'5px 16px',borderRadius:20,fontSize:12,fontWeight:600}}>Under Construction</span>
      </div>
    </Layout>
  );
}