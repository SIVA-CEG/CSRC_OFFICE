import Layout from '../components/Layout';

export default function Master() {
  return (
    <Layout title="Master" subtitle="Master data & configuration">
      <div style={{
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:420,textAlign:'center'
      }}>
        <div style={{width:80,height:80,borderRadius:20,background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,marginBottom:22,boxShadow:'0 0 32px rgba(245,158,11,0.2)'}}>◈</div>
        <h2 style={{fontSize:26,fontWeight:700,color:'var(--text-primary)',marginBottom:8}}>Master</h2>
        <p style={{fontSize:14,color:'var(--text-secondary)',marginBottom:20}}>Master data module is under construction.</p>
        <span style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b',padding:'5px 16px',borderRadius:20,fontSize:12,fontWeight:600}}>Under Construction</span>
      </div>
    </Layout>
  );
}