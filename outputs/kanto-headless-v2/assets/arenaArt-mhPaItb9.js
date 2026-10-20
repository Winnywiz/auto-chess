import{n as e,r as t}from"./rolldown-runtime-8BhlS34s.js";import{a as n}from"./vendor-react-FdNnaCtE.js";import{h as r,u as i}from"./gpuMode-DyE76UUh.js";import{n as a,t as o}from"./arenaFlag-B42VK0I7.js";import{$ as s,E as c,T as l,b as u,pn as d,qt as f,st as p,y as ee}from"./vendor-3d~sceneShot~arenaArt~HybridScene~propsLab~CoinLab-0pB0HyBI.js";import{at as te,nt as ne,ot as re,tt as ie}from"./vendor-3d~sceneShot~arenaArt~HybridScene~propsLab~CoinLab-BJeH7ZyX.js";import{A as ae,D as oe,E as m,b as se,j as ce,m as le,p as ue,y as de}from"./vendor-3d~sceneShot~arenaArt~HybridScene~propsLab~CoinLab-BFcirAZ1.js";import{l as h,u as fe}from"./vendor-3d~sceneShot~arenaArt~HybridScene~propsLab~CoinLab-Z6mcofU4.js";import{d as pe,u as me}from"./vendor-3d~sceneShot~arenaArt~HybridScene~propsLab~CoinLab-CwAApIHF.js";import{_ as he,c as ge,d as g,g as _e,h as ve,l as ye,m as be,n as xe,t as Se}from"./vendor-3d~sceneShot~arenaArt~HybridScene~propsLab-Co11Ut5K.js";var Ce=t({ARENA_GLOW:()=>z,ARENA_GLOW_LIGHT:()=>B,ARENA_V2:()=>o,ArenaArtPass:()=>C,HALO_K:()=>q,PROP_BANDS:()=>k,PROP_LAYER:()=>1,THIN_G:()=>J,artRender:()=>Q,glowMaterialV2:()=>y,patchProp:()=>v,propGradient:()=>_,setArtTheme:()=>b,warmPropPrograms:()=>S});function _(){return A||(A=new te(new Uint8Array(k.map(e=>Math.round(e*255))),k.length,1,f),A.minFilter=A.magFilter=p,A.generateMipmaps=!1,A.needsUpdate=!0,A)}function v(e){if(!o||e.userData.art2||e.type!==`MeshToonMaterial`)return;e.userData.art2=!0;let t=e;t.gradientMap=_();let n=e.onBeforeCompile,r=e.customProgramCacheKey();e.onBeforeCompile=(t,r)=>{n.call(e,t,r),Object.assign(t.uniforms,j),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vArtPos; varying vec3 vArtNor;`).replace(`#include <fog_vertex>`,`#include <fog_vertex>`+N),t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>
`+M).replace(`#include <gradientmap_pars_fragment>`,me.gradientmap_pars_fragment.replace(F,I)).replace(`#include <color_fragment>`,`#include <color_fragment>`+P).replace(L,R)},e.customProgramCacheKey=()=>r+`|art2`,e.needsUpdate=!0}function y(e=``){if(U.has(e))return W??(W=new l({toneMapped:!1}));let t=V.has(e),n=H.get(t);if(n)return n;let r=new _e({gradientMap:_()});v(r);let i=r.onBeforeCompile,a=r.customProgramCacheKey();return r.onBeforeCompile=(e,n)=>{i.call(r,e,n),e.fragmentShader=e.fragmentShader.replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
  totalEmissiveRadiance += diffuseColor.rgb * ${t?B.toFixed(2):`artGlow`};`)},r.customProgramCacheKey=()=>a+(t?`|glowL`:`|glow2`),H.set(t,r),r}function b(e){if(!o)return;let t=e.arena&&K[e.arena]||G[e.deco]||{};j.artGrainT.value=t.grain??1,j.artLift.value=t.lift??0,j.artGlow.value=t.glow??.42}function x(e){let t=e;if(!t.isMesh||e.userData.crisp)return!1;let n=t.material;for(let e of Array.isArray(n)?n:[n])if(!Y.has(e.type)||e.transparent||e.blending!==1||e.userData.crisp)return!1;return!0}function S(e,t,n,r){if(!o||we)return Promise.resolve();let i=[];e.traverse(e=>{if(e.isMesh){if(x(e)){let t=e.material;for(let e of Array.isArray(t)?t:[t])v(e)}else e.visible&&(e.visible=!1,i.push(e))}}),Z??(Z=new h(1,1,{type:1016}));let a=t.getRenderTarget(),s;try{t.setRenderTarget(Z),s=t.compileAsync(e,n,r)}finally{t.setRenderTarget(a);for(let e of i)e.visible=!0}return s}function C(){let e=g(e=>e.gl),t=g(e=>e.scene),n=g(e=>e.camera),r=(0,w.useMemo)(()=>{let e={type:s,minFilter:p,magFilter:p},t=new h(1,1,e);t.depthTexture=new ie(1,1);let n=new h(1,1,e);return{beauty:t,normal:n,quad:new Se(new ee({uniforms:{tD:{value:t.texture},tN:{value:n.texture},tZ:{value:t.depthTexture},res:{value:new de(1,1,1,1)},near:{value:.1},far:{value:100},edge:{value:E?.5:0},crease:{value:.3}},depthTest:!0,depthWrite:!0,vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,fragmentShader:X})),tiny:new h(1,1),nmat:new be,size:new ae,cc:new ue}},[]);(0,w.useEffect)(()=>()=>{var e;(e=r.beauty.depthTexture)==null||e.dispose(),r.beauty.dispose(),r.normal.dispose(),r.tiny.dispose(),r.nmat.dispose(),r.quad.dispose(),n.layers.set(0),n.layers.enable(1)},[r,n]),(0,w.useEffect)(()=>{n.layers.set(0)},[n]);let a=()=>{t.traverse(e=>{if(e.isLight){e.layers.enableAll();return}if(!e.isMesh)return;let t=x(e);if(e.layers.set(+!!t),t){let t=e.material;for(let e of Array.isArray(t)?t:[t])v(e)}});let a=i()!==`normal`,o=r.quad.material.uniforms;e.getDrawingBufferSize(r.size);let s=Math.max(1,Math.round(r.size.x/D)),c=Math.max(1,Math.round(r.size.y/D));(r.beauty.width!==s||r.beauty.height!==c)&&(r.beauty.setSize(s,c),r.normal.setSize(s,c),o.res.value.set(s,c,1/s,1/c)),o.near.value=n.near,o.far.value=n.far,o.crease.value=a?0:.3;let l=e.autoClear,u=e.getClearColor(r.cc),d=e.getClearAlpha();e.shadowMap.enabled&&e.shadowMap.needsUpdate&&(n.layers.enableAll(),e.setRenderTarget(r.tiny),e.render(t,n));let f=e.shadowMap.autoUpdate;e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!1,n.layers.set(1),e.setClearColor(0,0),e.setRenderTarget(r.beauty),e.clear(),e.render(t,n),a||(t.overrideMaterial=r.nmat,e.setRenderTarget(r.normal),e.clear(),e.render(t,n),t.overrideMaterial=null),e.setRenderTarget(null),e.setClearColor(u,d),e.clear(),r.quad.render(e),n.layers.set(0),e.autoClear=!1,e.render(t,n),e.autoClear=l,e.shadowMap.autoUpdate=f};return(0,w.useEffect)(()=>(Q.fn=a,()=>{Q.fn=null})),ye(a,1),null}var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,we,Q;function $(){return($=e((()=>{ge(),w=n(),re(),d(),oe(),pe(),c(),he(),fe(),ne(),u(),se(),ve(),ce(),le(),xe(),r(),a(),T=typeof location<`u`?new URLSearchParams(location.search):new URLSearchParams,E=o&&T.get(`arenaEdge`)!==`0`,D=o?Math.max(1,Math.min(4,Math.round(+(T.get(`arenaPx`)??1))||1)):1,O=Math.max(0,Math.min(1,+(T.get(`arenaGrain`)??1))),k=[.3,.55,.8],A=null,j={artTexels:{value:40},artShadow:{value:new m(.9,.94,1.12)},artLight:{value:new m(1.06,1.01,.9)},artEmi:{value:.14},artGrainK:{value:O},artGrainT:{value:1},artLift:{value:0},artGlow:{value:.42}},M=`
uniform float artTexels; uniform float artGrainK; uniform float artGrainT; uniform float artLift; uniform float artGlow; uniform vec3 artShadow; uniform vec3 artLight; uniform float artEmi;
varying vec3 vArtPos; varying vec3 vArtNor;
float artHash(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
float artGrain() {
  vec3 a = abs(vArtNor);
  bool top = a.y >= a.x && a.y >= a.z;
  vec2 uv = top ? vArtPos.xz : (a.x >= a.z ? vArtPos.zy + 17.0 : vArtPos.xy + 31.0);
  vec2 cell = floor(uv * artTexels);
  float h = artHash(cell), k = artHash(floor(cell / 3.0) + 7.0);
  float g = h < 0.07 ? 0.86 : h > 0.965 ? 1.08 : 1.0;
  return mix(1.0, g * (k < 0.18 ? 0.94 : k > 0.9 ? 1.04 : 1.0), artGrainK * artGrainT);
}
`,N=`
  { mat4 aM = modelMatrix;
    vec3 aSeed = vec3(0.0);
    #ifdef USE_INSTANCING
      aM = modelMatrix * instanceMatrix;
      float aI = float(gl_InstanceID);
      aSeed = vec3(mod(aI * 7.31, 37.0), mod(aI * 3.17, 11.0), mod(aI * 5.71, 29.0));
    #endif
    vArtPos = transformed * vec3(length(aM[0].xyz), length(aM[1].xyz), length(aM[2].xyz)) + aSeed;
    vArtNor = objectNormal; }`,P=`
  #ifndef USE_MAP
    diffuseColor.rgb *= artGrain();
  #endif`,F=`return vec3( texture2D( gradientMap, coord ).r );`,I=`{ float artG = mix( texture2D( gradientMap, coord ).r, 1.0, artLift ); return artG * mix( artShadow, artLight, smoothstep( 0.4, 0.75, artG ) ); }`,L=`vec3 totalEmissiveRadiance = emissive;`,R=`vec3 totalEmissiveRadiance = emissive;
  { float aM = max( max( totalEmissiveRadiance.r, totalEmissiveRadiance.g ), totalEmissiveRadiance.b );
    if ( aM > artEmi ) totalEmissiveRadiance *= artEmi / aM; }`,z=.42,B=.8,V=new Set([`lamp`,`orb`]),H=new Map,U=new Set([`disc`]),W=null,G={ice:{grain:.35,lift:.22,glow:.62},cave:{glow:.6},tunnel:{glow:.6},victory:{glow:.6}},K={lorelei:G.ice},q=o?.6:1,J=new Set([`blade`,`reed`,`tallBlade`]),Y=new Set([`MeshLambertMaterial`,`MeshPhongMaterial`,`MeshStandardMaterial`,`MeshPhysicalMaterial`,`MeshToonMaterial`]),X=`
  uniform sampler2D tD, tN, tZ; uniform vec4 res; uniform float near, far, edge, crease; varying vec2 vUv;
  float D(vec2 o){ return texture2D(tZ, vUv + o * res.zw).r; }
  float Z(vec2 o){ float d = D(o); return near * far / (far - d * (far - near)); }
  vec3 N(vec2 o){ return texture2D(tN, vUv + o * res.zw).rgb * 2.0 - 1.0; }
  void main(){
    vec4 c = texture2D(tD, vUv);
    float d0 = D(vec2(0.0));
    if (c.a < 0.5 || d0 >= 1.0) discard;
    float z = Z(vec2(0.0));
    float dz = 0.0;
    dz = max(dz, Z(vec2(1.0, 0.0)) - z); dz = max(dz, Z(vec2(-1.0, 0.0)) - z);
    dz = max(dz, Z(vec2(0.0, 1.0)) - z); dz = max(dz, Z(vec2(0.0, -1.0)) - z);
    float outl = step(z * 0.012, dz) * step(0.001, edge);
    float cr = 0.0;
    if (outl < 0.5 && crease > 0.0) {
      vec3 n = N(vec2(0.0));
      for (int i = 0; i < 4; i++) {
        vec2 o = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0);
        vec3 nn = N(o);
        float nd = dot(n - nn, vec3(0.3, 1.0, 0.6));
        cr += (1.0 - dot(n, nn)) * step(0.02, nd) * step(abs(Z(o) - z), z * 0.03) * step(z, Z(o) + z * 0.002);
      }
    }
    c.rgb *= outl > 0.5 ? (1.0 - edge) : (1.0 + crease * step(0.25, cr));
    gl_FragColor = vec4(c.rgb, 1.0);
    #include <colorspace_fragment>
    gl_FragDepth = d0;
  }`,Z=null,we=T.get(`arenaWarm`)===`0`,Q={fn:null}})))()}export{Q as a,v as c,Ce as i,b as l,q as n,y as o,J as r,$ as s,C as t,S as u};