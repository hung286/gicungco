const yT=()=>{};var Vd={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o_={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D=function(n,e){if(!n)throw Xs(e)},Xs=function(n){return new Error("Firebase Database ("+o_.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const a_=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let r=n.charCodeAt(s);r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):(r&64512)===55296&&s+1<n.length&&(n.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(n.charCodeAt(++s)&1023),e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},ET=function(n){const e=[];let t=0,s=0;for(;t<n.length;){const r=n[t++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const i=n[t++];e[s++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){const i=n[t++],o=n[t++],c=n[t++],l=((r&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[s++]=String.fromCharCode(55296+(l>>10)),e[s++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[s++]=String.fromCharCode((r&15)<<12|(i&63)<<6|o&63)}}return e.join("")},ua={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<n.length;r+=3){const i=n[r],o=r+1<n.length,c=o?n[r+1]:0,l=r+2<n.length,u=l?n[r+2]:0,d=i>>2,p=(i&3)<<4|c>>4;let _=(c&15)<<2|u>>6,E=u&63;l||(E=64,o||(_=64)),s.push(t[d],t[p],t[_],t[E])}return s.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(a_(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):ET(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<n.length;){const i=t[n.charAt(r++)],c=r<n.length?t[n.charAt(r)]:0;++r;const u=r<n.length?t[n.charAt(r)]:64;++r;const p=r<n.length?t[n.charAt(r)]:64;if(++r,i==null||c==null||u==null||p==null)throw new TT;const _=i<<2|c>>4;if(s.push(_),u!==64){const E=c<<4&240|u>>2;if(s.push(E),p!==64){const C=u<<6&192|p;s.push(C)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class TT extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const c_=function(n){const e=a_(n);return ua.encodeByteArray(e,!0)},Ao=function(n){return c_(n).replace(/\./g,"")},Co=function(n){try{return ua.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vT(n){return l_(void 0,n)}function l_(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!wT(t)||(n[t]=l_(n[t],e[t]));return n}function wT(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function u_(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IT=()=>u_().__FIREBASE_DEFAULTS__,AT=()=>{if(typeof process>"u"||typeof Vd>"u")return;const n=Vd.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},CT=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Co(n[1]);return e&&JSON.parse(e)},ha=()=>{try{return yT()||IT()||AT()||CT()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},h_=n=>{var e,t;return(t=(e=ha())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},da=n=>{const e=h_(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),s]:[e.substring(0,t),s]},d_=()=>{var n;return(n=ha())==null?void 0:n.config},f_=n=>{var e;return(e=ha())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ge{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,s)=>{t?this.reject(t):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,s))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ft(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function mi(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wl(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},s=e||"demo-project",r=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${s}`,aud:s,iat:r,exp:r+3600,auth_time:r,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Ao(JSON.stringify(t)),Ao(JSON.stringify(o)),""].join(".")}const Br={};function RT(){const n={prod:[],emulator:[]};for(const e of Object.keys(Br))Br[e]?n.emulator.push(e):n.prod.push(e);return n}function ST(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let Ld=!1;function gi(n,e){if(typeof window>"u"||typeof document>"u"||!ft(window.location.host)||Br[n]===e||Br[n]||Ld)return;Br[n]=e;function t(_){return`__firebase__banner__${_}`}const s="__firebase__banner",i=RT().prod.length>0;function o(){const _=document.getElementById(s);_&&_.remove()}function c(_){_.style.display="flex",_.style.background="#7faaf0",_.style.position="fixed",_.style.bottom="5px",_.style.left="5px",_.style.padding=".5em",_.style.borderRadius="5px",_.style.alignItems="center"}function l(_,E){_.setAttribute("width","24"),_.setAttribute("id",E),_.setAttribute("height","24"),_.setAttribute("viewBox","0 0 24 24"),_.setAttribute("fill","none"),_.style.marginLeft="-6px"}function u(){const _=document.createElement("span");return _.style.cursor="pointer",_.style.marginLeft="16px",_.style.fontSize="24px",_.innerHTML=" &times;",_.onclick=()=>{Ld=!0,o()},_}function d(_,E){_.setAttribute("id",E),_.innerText="Learn more",_.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",_.setAttribute("target","__blank"),_.style.paddingLeft="5px",_.style.textDecoration="underline"}function p(){const _=ST(s),E=t("text"),C=document.getElementById(E)||document.createElement("span"),k=t("learnmore"),b=document.getElementById(k)||document.createElement("a"),V=t("preprendIcon"),F=document.getElementById(V)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(_.created){const U=_.element;c(U),d(b,k);const K=u();l(F,V),U.append(F,C,b,K),document.body.appendChild(U)}i?(C.innerText="Preview backend disconnected.",F.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(F.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,C.innerText="Preview backend running in this workspace."),C.setAttribute("id",E)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $e(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Hl(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test($e())}function bT(){var e;const n=(e=ha())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function PT(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function kT(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function p_(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function NT(){const n=$e();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function DT(){return o_.NODE_ADMIN===!0}function OT(){return!bT()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function zl(){try{return typeof indexedDB=="object"}catch{return!1}}function xT(){return new Promise((n,e)=>{try{let t=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),t||self.indexedDB.deleteDatabase(s),n(!0)},r.onupgradeneeded=()=>{t=!1},r.onerror=()=>{var i;e(((i=r.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const MT="FirebaseError";class At extends Error{constructor(e,t,s){super(t),this.code=e,this.customData=s,this.name=MT,Object.setPrototypeOf(this,At.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Js.prototype.create)}}class Js{constructor(e,t,s){this.service=e,this.serviceName=t,this.errors=s}create(e,...t){const s=t[0]||{},r=`${this.service}/${e}`,i=this.errors[e],o=i?VT(i,s):"Error",c=`${this.serviceName}: ${o} (${r}).`;return new At(r,c,s)}}function VT(n,e){return n.replace(LT,(t,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const LT=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jr(n){return JSON.parse(n)}function Ce(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const __=function(n){let e={},t={},s={},r="";try{const i=n.split(".");e=Jr(Co(i[0])||""),t=Jr(Co(i[1])||""),r=i[2],s=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:s,signature:r}},FT=function(n){const e=__(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},UT=function(n){const e=__(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ct(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function Jn(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function Ro(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function So(n,e,t){const s={};for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&(s[r]=e.call(t,n[r],r,n));return s}function zt(n,e){if(n===e)return!0;const t=Object.keys(n),s=Object.keys(e);for(const r of t){if(!s.includes(r))return!1;const i=n[r],o=e[r];if(Fd(i)&&Fd(o)){if(!zt(i,o))return!1}else if(i!==o)return!1}for(const r of s)if(!t.includes(r))return!1;return!0}function Fd(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zs(n){const e=[];for(const[t,s]of Object.entries(n))Array.isArray(s)?s.forEach(r=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BT{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const s=this.W_;if(typeof e=="string")for(let p=0;p<16;p++)s[p]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let p=0;p<16;p++)s[p]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let p=16;p<80;p++){const _=s[p-3]^s[p-8]^s[p-14]^s[p-16];s[p]=(_<<1|_>>>31)&4294967295}let r=this.chain_[0],i=this.chain_[1],o=this.chain_[2],c=this.chain_[3],l=this.chain_[4],u,d;for(let p=0;p<80;p++){p<40?p<20?(u=c^i&(o^c),d=1518500249):(u=i^o^c,d=1859775393):p<60?(u=i&o|c&(i|o),d=2400959708):(u=i^o^c,d=3395469782);const _=(r<<5|r>>>27)+u+l+d+s[p]&4294967295;l=c,c=o,o=(i<<30|i>>>2)&4294967295,i=r,r=_}this.chain_[0]=this.chain_[0]+r&4294967295,this.chain_[1]=this.chain_[1]+i&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+c&4294967295,this.chain_[4]=this.chain_[4]+l&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const s=t-this.blockSize;let r=0;const i=this.buf_;let o=this.inbuf_;for(;r<t;){if(o===0)for(;r<=s;)this.compress_(e,r),r+=this.blockSize;if(typeof e=="string"){for(;r<t;)if(i[o]=e.charCodeAt(r),++o,++r,o===this.blockSize){this.compress_(i),o=0;break}}else for(;r<t;)if(i[o]=e[r],++o,++r,o===this.blockSize){this.compress_(i),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let r=this.blockSize-1;r>=56;r--)this.buf_[r]=t&255,t/=256;this.compress_(this.buf_);let s=0;for(let r=0;r<5;r++)for(let i=24;i>=0;i-=8)e[s]=this.chain_[r]>>i&255,++s;return e}}function qT(n,e){const t=new $T(n,e);return t.subscribe.bind(t)}class $T{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,s){let r;if(e===void 0&&t===void 0&&s===void 0)throw new Error("Missing Observer.");jT(e,["next","error","complete"])?r=e:r={next:e,error:t,complete:s},r.next===void 0&&(r.next=Pc),r.error===void 0&&(r.error=Pc),r.complete===void 0&&(r.complete=Pc);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function jT(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Pc(){}function xs(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WT=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let r=n.charCodeAt(s);if(r>=55296&&r<=56319){const i=r-55296;s++,D(s<n.length,"Surrogate pair missing trail surrogate.");const o=n.charCodeAt(s)-56320;r=65536+(i<<10)+o}r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):r<65536?(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},fa=function(n){let e=0;for(let t=0;t<n.length;t++){const s=n.charCodeAt(t);s<128?e++:s<2048?e+=2:s>=55296&&s<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HT=1e3,zT=2,GT=4*60*60*1e3,KT=.5;function QT(n,e=HT,t=zT){const s=e*Math.pow(t,n),r=Math.round(KT*s*(Math.random()-.5)*2);return Math.min(GT,s+r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function j(n){return n&&n._delegate?n._delegate:n}class dt{constructor(e,t,s){this.name=e,this.instanceFactory=t,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class YT{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const s=new Ge;if(this.instancesDeferred.set(t,s),this.isInitialized(t)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:t});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(r){if(s)return null;throw r}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(JT(e))try{this.getOrInitializeService({instanceIdentifier:zn})}catch{}for(const[t,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:r});s.resolve(i)}catch{}}}}clearInstance(e=zn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=zn){return this.instances.has(e)}getOptions(e=zn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);s===c&&o.resolve(r)}return r}onInit(e,t){const s=this.normalizeInstanceIdentifier(t),r=this.onInitCallbacks.get(s)??new Set;r.add(e),this.onInitCallbacks.set(s,r);const i=this.instances.get(s);return i&&e(i,s),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const s=this.onInitCallbacks.get(t);if(s)for(const r of s)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:XT(e),options:t}),this.instances.set(e,s),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=zn){return this.component?this.component.multipleInstances?e:zn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function XT(n){return n===zn?void 0:n}function JT(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZT{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new YT(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var X;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(X||(X={}));const ev={debug:X.DEBUG,verbose:X.VERBOSE,info:X.INFO,warn:X.WARN,error:X.ERROR,silent:X.SILENT},tv=X.INFO,nv={[X.DEBUG]:"log",[X.VERBOSE]:"log",[X.INFO]:"info",[X.WARN]:"warn",[X.ERROR]:"error"},sv=(n,e,...t)=>{if(e<n.logLevel)return;const s=new Date().toISOString(),r=nv[e];if(r)console[r](`[${s}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class yi{constructor(e){this.name=e,this._logLevel=tv,this._logHandler=sv,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in X))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?ev[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,X.DEBUG,...e),this._logHandler(this,X.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,X.VERBOSE,...e),this._logHandler(this,X.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,X.INFO,...e),this._logHandler(this,X.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,X.WARN,...e),this._logHandler(this,X.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,X.ERROR,...e),this._logHandler(this,X.ERROR,...e)}}const rv=(n,e)=>e.some(t=>n instanceof t);let Ud,Bd;function iv(){return Ud||(Ud=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ov(){return Bd||(Bd=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const m_=new WeakMap,el=new WeakMap,g_=new WeakMap,kc=new WeakMap,Gl=new WeakMap;function av(n){const e=new Promise((t,s)=>{const r=()=>{n.removeEventListener("success",i),n.removeEventListener("error",o)},i=()=>{t(mn(n.result)),r()},o=()=>{s(n.error),r()};n.addEventListener("success",i),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&m_.set(t,n)}).catch(()=>{}),Gl.set(e,n),e}function cv(n){if(el.has(n))return;const e=new Promise((t,s)=>{const r=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",o),n.removeEventListener("abort",o)},i=()=>{t(),r()},o=()=>{s(n.error||new DOMException("AbortError","AbortError")),r()};n.addEventListener("complete",i),n.addEventListener("error",o),n.addEventListener("abort",o)});el.set(n,e)}let tl={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return el.get(n);if(e==="objectStoreNames")return n.objectStoreNames||g_.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return mn(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function lv(n){tl=n(tl)}function uv(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const s=n.call(Nc(this),e,...t);return g_.set(s,e.sort?e.sort():[e]),mn(s)}:ov().includes(n)?function(...e){return n.apply(Nc(this),e),mn(m_.get(this))}:function(...e){return mn(n.apply(Nc(this),e))}}function hv(n){return typeof n=="function"?uv(n):(n instanceof IDBTransaction&&cv(n),rv(n,iv())?new Proxy(n,tl):n)}function mn(n){if(n instanceof IDBRequest)return av(n);if(kc.has(n))return kc.get(n);const e=hv(n);return e!==n&&(kc.set(n,e),Gl.set(e,n)),e}const Nc=n=>Gl.get(n);function dv(n,e,{blocked:t,upgrade:s,blocking:r,terminated:i}={}){const o=indexedDB.open(n,e),c=mn(o);return s&&o.addEventListener("upgradeneeded",l=>{s(mn(o.result),l.oldVersion,l.newVersion,mn(o.transaction),l)}),t&&o.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),c.then(l=>{i&&l.addEventListener("close",()=>i()),r&&l.addEventListener("versionchange",u=>r(u.oldVersion,u.newVersion,u))}).catch(()=>{}),c}const fv=["get","getKey","getAll","getAllKeys","count"],pv=["put","add","delete","clear"],Dc=new Map;function qd(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Dc.get(e))return Dc.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,r=pv.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(r||fv.includes(t)))return;const i=async function(o,...c){const l=this.transaction(o,r?"readwrite":"readonly");let u=l.store;return s&&(u=u.index(c.shift())),(await Promise.all([u[t](...c),r&&l.done]))[0]};return Dc.set(e,i),i}lv(n=>({...n,get:(e,t,s)=>qd(e,t)||n.get(e,t,s),has:(e,t)=>!!qd(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _v{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(mv(t)){const s=t.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(t=>t).join(" ")}}function mv(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const nl="@firebase/app",$d="0.14.4";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gt=new yi("@firebase/app"),gv="@firebase/app-compat",yv="@firebase/analytics-compat",Ev="@firebase/analytics",Tv="@firebase/app-check-compat",vv="@firebase/app-check",wv="@firebase/auth",Iv="@firebase/auth-compat",Av="@firebase/database",Cv="@firebase/data-connect",Rv="@firebase/database-compat",Sv="@firebase/functions",bv="@firebase/functions-compat",Pv="@firebase/installations",kv="@firebase/installations-compat",Nv="@firebase/messaging",Dv="@firebase/messaging-compat",Ov="@firebase/performance",xv="@firebase/performance-compat",Mv="@firebase/remote-config",Vv="@firebase/remote-config-compat",Lv="@firebase/storage",Fv="@firebase/storage-compat",Uv="@firebase/firestore",Bv="@firebase/ai",qv="@firebase/firestore-compat",$v="firebase",jv="12.4.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sl="[DEFAULT]",Wv={[nl]:"fire-core",[gv]:"fire-core-compat",[Ev]:"fire-analytics",[yv]:"fire-analytics-compat",[vv]:"fire-app-check",[Tv]:"fire-app-check-compat",[wv]:"fire-auth",[Iv]:"fire-auth-compat",[Av]:"fire-rtdb",[Cv]:"fire-data-connect",[Rv]:"fire-rtdb-compat",[Sv]:"fire-fn",[bv]:"fire-fn-compat",[Pv]:"fire-iid",[kv]:"fire-iid-compat",[Nv]:"fire-fcm",[Dv]:"fire-fcm-compat",[Ov]:"fire-perf",[xv]:"fire-perf-compat",[Mv]:"fire-rc",[Vv]:"fire-rc-compat",[Lv]:"fire-gcs",[Fv]:"fire-gcs-compat",[Uv]:"fire-fst",[qv]:"fire-fst-compat",[Bv]:"fire-vertex","fire-js":"fire-js",[$v]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bo=new Map,Hv=new Map,rl=new Map;function jd(n,e){try{n.container.addComponent(e)}catch(t){Gt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function wt(n){const e=n.name;if(rl.has(e))return Gt.debug(`There were multiple attempts to register component ${e}.`),!1;rl.set(e,n);for(const t of bo.values())jd(t,n);for(const t of Hv.values())jd(t,n);return!0}function Mn(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Ke(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zv={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},gn=new Js("app","Firebase",zv);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gv{constructor(e,t,s){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new dt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw gn.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vn=jv;function Kv(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const s={name:sl,automaticDataCollectionEnabled:!0,...e},r=s.name;if(typeof r!="string"||!r)throw gn.create("bad-app-name",{appName:String(r)});if(t||(t=d_()),!t)throw gn.create("no-options");const i=bo.get(r);if(i){if(zt(t,i.options)&&zt(s,i.config))return i;throw gn.create("duplicate-app",{appName:r})}const o=new ZT(r);for(const l of rl.values())o.addComponent(l);const c=new Gv(t,s,o);return bo.set(r,c),c}function er(n=sl){const e=bo.get(n);if(!e&&n===sl&&d_())return Kv();if(!e)throw gn.create("no-app",{appName:n});return e}function Ye(n,e,t){let s=Wv[n]??n;t&&(s+=`-${t}`);const r=s.match(/\s|\//),i=e.match(/\s|\//);if(r||i){const o=[`Unable to register library "${s}" with version "${e}":`];r&&o.push(`library name "${s}" contains illegal characters (whitespace or "/")`),r&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Gt.warn(o.join(" "));return}wt(new dt(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qv="firebase-heartbeat-database",Yv=1,Zr="firebase-heartbeat-store";let Oc=null;function y_(){return Oc||(Oc=dv(Qv,Yv,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Zr)}catch(t){console.warn(t)}}}}).catch(n=>{throw gn.create("idb-open",{originalErrorMessage:n.message})})),Oc}async function Xv(n){try{const t=(await y_()).transaction(Zr),s=await t.objectStore(Zr).get(E_(n));return await t.done,s}catch(e){if(e instanceof At)Gt.warn(e.message);else{const t=gn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Gt.warn(t.message)}}}async function Wd(n,e){try{const s=(await y_()).transaction(Zr,"readwrite");await s.objectStore(Zr).put(e,E_(n)),await s.done}catch(t){if(t instanceof At)Gt.warn(t.message);else{const s=gn.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Gt.warn(s.message)}}}function E_(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jv=1024,Zv=30;class ew{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new nw(t),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,t;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Hd();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:r}),this._heartbeatsCache.heartbeats.length>Zv){const o=sw(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){Gt.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Hd(),{heartbeatsToSend:s,unsentEntries:r}=tw(this._heartbeatsCache.heartbeats),i=Ao(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Gt.warn(t),""}}}function Hd(){return new Date().toISOString().substring(0,10)}function tw(n,e=Jv){const t=[];let s=n.slice();for(const r of n){const i=t.find(o=>o.agent===r.agent);if(i){if(i.dates.push(r.date),zd(t)>e){i.dates.pop();break}}else if(t.push({agent:r.agent,dates:[r.date]}),zd(t)>e){t.pop();break}s=s.slice(1)}return{heartbeatsToSend:t,unsentEntries:s}}class nw{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return zl()?xT().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Xv(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return Wd(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return Wd(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function zd(n){return Ao(JSON.stringify({version:2,heartbeats:n})).length}function sw(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let s=1;s<n.length;s++)n[s].date<t&&(t=n[s].date,e=s);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rw(n){wt(new dt("platform-logger",e=>new _v(e),"PRIVATE")),wt(new dt("heartbeat",e=>new ew(e),"PRIVATE")),Ye(nl,$d,n),Ye(nl,$d,"esm2020"),Ye("fire-js","")}rw("");function T_(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const iw=T_,v_=new Js("auth","Firebase",T_());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Po=new yi("@firebase/auth");function ow(n,...e){Po.logLevel<=X.WARN&&Po.warn(`Auth (${Vn}): ${n}`,...e)}function po(n,...e){Po.logLevel<=X.ERROR&&Po.error(`Auth (${Vn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lt(n,...e){throw Ql(n,...e)}function yt(n,...e){return Ql(n,...e)}function Kl(n,e,t){const s={...iw(),[e]:t};return new Js("auth","Firebase",s).create(e,{appName:n.name})}function yn(n){return Kl(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function w_(n,e,t){const s=t;if(!(e instanceof s))throw s.name!==e.constructor.name&&Lt(n,"argument-error"),Kl(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Ql(n,...e){if(typeof n!="string"){const t=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=n.name),n._errorFactory.create(t,...s)}return v_.create(n,...e)}function $(n,e,...t){if(!n)throw Ql(e,...t)}function qt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw po(e),new Error(e)}function Kt(n,e){n||qt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function il(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function aw(){return Gd()==="http:"||Gd()==="https:"}function Gd(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cw(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(aw()||kT()||"connection"in navigator)?navigator.onLine:!0}function lw(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ei{constructor(e,t){this.shortDelay=e,this.longDelay=t,Kt(t>e,"Short delay should be less than long delay!"),this.isMobile=Hl()||p_()}get(){return cw()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yl(n,e){Kt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I_{static initialize(e,t,s){this.fetchImpl=e,t&&(this.headersImpl=t),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;qt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;qt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;qt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uw={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hw=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],dw=new Ei(3e4,6e4);function Xl(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function tr(n,e,t,s,r={}){return A_(n,r,async()=>{let i={},o={};s&&(e==="GET"?o=s:i={body:JSON.stringify(s)});const c=Zs({key:n.config.apiKey,...o}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const u={method:e,headers:l,...i};return PT()||(u.referrerPolicy="no-referrer"),n.emulatorConfig&&ft(n.emulatorConfig.host)&&(u.credentials="include"),I_.fetch()(await C_(n,n.config.apiHost,t,c),u)})}async function A_(n,e,t){n._canInitEmulator=!1;const s={...uw,...e};try{const r=new pw(n),i=await Promise.race([t(),r.promise]);r.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw to(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[l,u]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw to(n,"credential-already-in-use",o);if(l==="EMAIL_EXISTS")throw to(n,"email-already-in-use",o);if(l==="USER_DISABLED")throw to(n,"user-disabled",o);const d=s[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw Kl(n,d,u);Lt(n,d)}}catch(r){if(r instanceof At)throw r;Lt(n,"network-request-failed",{message:String(r)})}}async function fw(n,e,t,s,r={}){const i=await tr(n,e,t,s,r);return"mfaPendingCredential"in i&&Lt(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function C_(n,e,t,s){const r=`${e}${t}?${s}`,i=n,o=i.config.emulator?Yl(n.config,r):`${n.config.apiScheme}://${r}`;return hw.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}class pw{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,s)=>{this.timer=setTimeout(()=>s(yt(this.auth,"network-request-failed")),dw.get())})}}function to(n,e,t){const s={appName:n.name};t.email&&(s.email=t.email),t.phoneNumber&&(s.phoneNumber=t.phoneNumber);const r=yt(n,e,s);return r.customData._tokenResponse=t,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _w(n,e){return tr(n,"POST","/v1/accounts:delete",e)}async function ko(n,e){return tr(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function mw(n,e=!1){const t=j(n),s=await t.getIdToken(e),r=pa(s);$(r&&r.exp&&r.auth_time&&r.iat,t.auth,"internal-error");const i=typeof r.firebase=="object"?r.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:r,token:s,authTime:qr(xc(r.auth_time)),issuedAtTime:qr(xc(r.iat)),expirationTime:qr(xc(r.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function xc(n){return Number(n)*1e3}function pa(n){const[e,t,s]=n.split(".");if(e===void 0||t===void 0||s===void 0)return po("JWT malformed, contained fewer than 3 sections"),null;try{const r=Co(t);return r?JSON.parse(r):(po("Failed to decode base64 JWT payload"),null)}catch(r){return po("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function Kd(n){const e=pa(n);return $(e,"internal-error"),$(typeof e.exp<"u","internal-error"),$(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ei(n,e,t=!1){if(t)return e;try{return await e}catch(s){throw s instanceof At&&gw(s)&&n.auth.currentUser===n&&await n.auth.signOut(),s}}function gw({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yw{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const s=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ol{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=qr(this.lastLoginAt),this.creationTime=qr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function No(n){var p;const e=n.auth,t=await n.getIdToken(),s=await ei(n,ko(e,{idToken:t}));$(s==null?void 0:s.users.length,e,"internal-error");const r=s.users[0];n._notifyReloadListener(r);const i=(p=r.providerUserInfo)!=null&&p.length?R_(r.providerUserInfo):[],o=Tw(n.providerData,i),c=n.isAnonymous,l=!(n.email&&r.passwordHash)&&!(o!=null&&o.length),u=c?l:!1,d={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new ol(r.createdAt,r.lastLoginAt),isAnonymous:u};Object.assign(n,d)}async function Ew(n){const e=j(n);await No(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Tw(n,e){return[...n.filter(s=>!e.some(r=>r.providerId===s.providerId)),...e]}function R_(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vw(n,e){const t=await A_(n,{},async()=>{const s=Zs({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=n.config,o=await C_(n,r,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:s};return n.emulatorConfig&&ft(n.emulatorConfig.host)&&(l.credentials="include"),I_.fetch()(o,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function ww(n,e){return tr(n,"POST","/v2/accounts:revokeToken",Xl(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rs{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){$(e.idToken,"internal-error"),$(typeof e.idToken<"u","internal-error"),$(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Kd(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){$(e.length!==0,"internal-error");const t=Kd(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:($(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:s,refreshToken:r,expiresIn:i}=await vw(e,t);this.updateTokensAndExpiration(s,r,Number(i))}updateTokensAndExpiration(e,t,s){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,t){const{refreshToken:s,accessToken:r,expirationTime:i}=t,o=new Rs;return s&&($(typeof s=="string","internal-error",{appName:e}),o.refreshToken=s),r&&($(typeof r=="string","internal-error",{appName:e}),o.accessToken=r),i&&($(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Rs,this.toJSON())}_performRefresh(){return qt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function on(n,e){$(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class mt{constructor({uid:e,auth:t,stsTokenManager:s,...r}){this.providerId="firebase",this.proactiveRefresh=new yw(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new ol(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const t=await ei(this,this.stsTokenManager.getToken(this.auth,e));return $(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return mw(this,e)}reload(){return Ew(this)}_assign(e){this!==e&&($(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new mt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){$(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),t&&await No(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ke(this.auth.app))return Promise.reject(yn(this.auth));const e=await this.getIdToken();return await ei(this,_w(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const s=t.displayName??void 0,r=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,u=t.createdAt??void 0,d=t.lastLoginAt??void 0,{uid:p,emailVerified:_,isAnonymous:E,providerData:C,stsTokenManager:k}=t;$(p&&k,e,"internal-error");const b=Rs.fromJSON(this.name,k);$(typeof p=="string",e,"internal-error"),on(s,e.name),on(r,e.name),$(typeof _=="boolean",e,"internal-error"),$(typeof E=="boolean",e,"internal-error"),on(i,e.name),on(o,e.name),on(c,e.name),on(l,e.name),on(u,e.name),on(d,e.name);const V=new mt({uid:p,auth:e,email:r,emailVerified:_,displayName:s,isAnonymous:E,photoURL:o,phoneNumber:i,tenantId:c,stsTokenManager:b,createdAt:u,lastLoginAt:d});return C&&Array.isArray(C)&&(V.providerData=C.map(F=>({...F}))),l&&(V._redirectEventId=l),V}static async _fromIdTokenResponse(e,t,s=!1){const r=new Rs;r.updateFromServerResponse(t);const i=new mt({uid:t.localId,auth:e,stsTokenManager:r,isAnonymous:s});return await No(i),i}static async _fromGetAccountInfoResponse(e,t,s){const r=t.users[0];$(r.localId!==void 0,"internal-error");const i=r.providerUserInfo!==void 0?R_(r.providerUserInfo):[],o=!(r.email&&r.passwordHash)&&!(i!=null&&i.length),c=new Rs;c.updateFromIdToken(s);const l=new mt({uid:r.localId,auth:e,stsTokenManager:c,isAnonymous:o}),u={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new ol(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,u),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qd=new Map;function $t(n){Kt(n instanceof Function,"Expected a class definition");let e=Qd.get(n);return e?(Kt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Qd.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S_{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}S_.type="NONE";const Yd=S_;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _o(n,e,t){return`firebase:${n}:${e}:${t}`}class Ss{constructor(e,t,s){this.persistence=e,this.auth=t,this.userKey=s;const{config:r,name:i}=this.auth;this.fullUserKey=_o(this.userKey,r.apiKey,i),this.fullPersistenceKey=_o("persistence",r.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await ko(this.auth,{idToken:e}).catch(()=>{});return t?mt._fromGetAccountInfoResponse(this.auth,t,e):null}return mt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,s="authUser"){if(!t.length)return new Ss($t(Yd),e,s);const r=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=r[0]||$t(Yd);const o=_o(s,e.config.apiKey,e.name);let c=null;for(const u of t)try{const d=await u._get(o);if(d){let p;if(typeof d=="string"){const _=await ko(e,{idToken:d}).catch(()=>{});if(!_)break;p=await mt._fromGetAccountInfoResponse(e,_,d)}else p=mt._fromJSON(e,d);u!==i&&(c=p),i=u;break}}catch{}const l=r.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new Ss(i,e,s):(i=l[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new Ss(i,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xd(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(N_(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(b_(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(O_(e))return"Blackberry";if(x_(e))return"Webos";if(P_(e))return"Safari";if((e.includes("chrome/")||k_(e))&&!e.includes("edge/"))return"Chrome";if(D_(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=n.match(t);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function b_(n=$e()){return/firefox\//i.test(n)}function P_(n=$e()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function k_(n=$e()){return/crios\//i.test(n)}function N_(n=$e()){return/iemobile/i.test(n)}function D_(n=$e()){return/android/i.test(n)}function O_(n=$e()){return/blackberry/i.test(n)}function x_(n=$e()){return/webos/i.test(n)}function Jl(n=$e()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Iw(n=$e()){var e;return Jl(n)&&!!((e=window.navigator)!=null&&e.standalone)}function Aw(){return NT()&&document.documentMode===10}function M_(n=$e()){return Jl(n)||D_(n)||x_(n)||O_(n)||/windows phone/i.test(n)||N_(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function V_(n,e=[]){let t;switch(n){case"Browser":t=Xd($e());break;case"Worker":t=`${Xd($e())}-${n}`;break;default:t=n}const s=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Vn}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cw{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const s=i=>new Promise((o,c)=>{try{const l=e(i);o(l)}catch(l){c(l)}});s.onAbort=t,this.queue.push(s);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const s of this.queue)await s(e),s.onAbort&&t.push(s.onAbort)}catch(s){t.reverse();for(const r of t)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Rw(n,e={}){return tr(n,"GET","/v2/passwordPolicy",Xl(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sw=6;class bw{constructor(e){var s;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Sw,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((s=e.allowedNonAlphanumericCharacters)==null?void 0:s.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const s=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;s&&(t.meetsMinPasswordLength=e.length>=s),r&&(t.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let s;for(let r=0;r<e.length;r++)s=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(t,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,t,s,r,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pw{constructor(e,t,s,r){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=s,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Jd(this),this.idTokenSubscription=new Jd(this),this.beforeStateQueue=new Cw(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=v_,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=$t(t)),this._initializationPromise=this.queue(async()=>{var s,r,i;if(!this._deleted&&(this.persistenceManager=await Ss.create(this,e),(s=this._resolvePersistenceManagerAvailable)==null||s.call(this),!this._deleted)){if((r=this._popupRedirectResolver)!=null&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await ko(this,{idToken:e}),s=await mt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(s)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Ke(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let s=t,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=s==null?void 0:s._redirectEventId,l=await this.tryRedirectSignIn(e);(!o||o===c)&&(l!=null&&l.user)&&(s=l.user,r=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return $(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await No(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=lw()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ke(this.app))return Promise.reject(yn(this));const t=e?j(e):null;return t&&$(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&$(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ke(this.app)?Promise.reject(yn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ke(this.app)?Promise.reject(yn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence($t(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Rw(this),t=new bw(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Js("auth","Firebase",e())}onAuthStateChanged(e,t,s){return this.registerStateListener(this.authStateSubscription,e,t,s)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,s){return this.registerStateListener(this.idTokenSubscription,e,t,s)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(s.tenantId=this.tenantId),await ww(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const s=await this.getOrInitRedirectPersistenceManager(t);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&$t(e)||this._popupRedirectResolver;$(t,this,"argument-error"),this.redirectPersistenceManager=await Ss.create(this,[$t(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,s;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((s=this.redirectUser)==null?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,s,r){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if($(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,s,r);return()=>{o=!0,l()}}else{const l=e.addObserver(t);return()=>{o=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return $(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=V_(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var r;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((r=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const s=await this._getAppCheckToken();return s&&(e["X-Firebase-AppCheck"]=s),e}async _getAppCheckToken(){var t;if(Ke(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&ow(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function nr(n){return j(n)}class Jd{constructor(e){this.auth=e,this.observer=null,this.addObserver=qT(t=>this.observer=t)}get next(){return $(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Zl={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function kw(n){Zl=n}function Nw(n){return Zl.loadJS(n)}function Dw(){return Zl.gapiScript}function Ow(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xw(n,e){const t=Mn(n,"auth");if(t.isInitialized()){const r=t.getImmediate(),i=t.getOptions();if(zt(i,e??{}))return r;Lt(r,"already-initialized")}return t.initialize({options:e})}function Mw(n,e){const t=(e==null?void 0:e.persistence)||[],s=(Array.isArray(t)?t:[t]).map($t);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function Vw(n,e,t){const s=nr(n);$(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const r=!1,i=L_(e),{host:o,port:c}=Lw(e),l=c===null?"":`:${c}`,u={url:`${i}//${o}${l}/`},d=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!s._canInitEmulator){$(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),$(zt(u,s.config.emulator)&&zt(d,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=u,s.emulatorConfig=d,s.settings.appVerificationDisabledForTesting=!0,ft(o)?(mi(`${i}//${o}${l}`),gi("Auth",!0)):Fw()}function L_(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Lw(n){const e=L_(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const s=t[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(s);if(r){const i=r[1];return{host:i,port:Zd(s.substr(i.length+1))}}else{const[i,o]=s.split(":");return{host:i,port:Zd(o)}}}function Zd(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Fw(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F_{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return qt("not implemented")}_getIdTokenResponse(e){return qt("not implemented")}_linkToIdToken(e,t){return qt("not implemented")}_getReauthenticationResolver(e){return qt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bs(n,e){return fw(n,"POST","/v1/accounts:signInWithIdp",Xl(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uw="http://localhost";class Zn extends F_{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Zn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Lt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:r,...i}=t;if(!s||!r)return null;const o=new Zn(s,r);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return bs(e,t)}_linkToIdToken(e,t){const s=this.buildRequest();return s.idToken=t,bs(e,s)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,bs(e,t)}buildRequest(){const e={requestUri:Uw,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Zs(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _a{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti extends _a{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an extends Ti{constructor(){super("facebook.com")}static credential(e){return Zn._fromParams({providerId:an.PROVIDER_ID,signInMethod:an.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return an.credentialFromTaggedObject(e)}static credentialFromError(e){return an.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return an.credential(e.oauthAccessToken)}catch{return null}}}an.FACEBOOK_SIGN_IN_METHOD="facebook.com";an.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn extends Ti{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Zn._fromParams({providerId:cn.PROVIDER_ID,signInMethod:cn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return cn.credentialFromTaggedObject(e)}static credentialFromError(e){return cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:s}=e;if(!t&&!s)return null;try{return cn.credential(t,s)}catch{return null}}}cn.GOOGLE_SIGN_IN_METHOD="google.com";cn.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln extends Ti{constructor(){super("github.com")}static credential(e){return Zn._fromParams({providerId:ln.PROVIDER_ID,signInMethod:ln.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ln.credentialFromTaggedObject(e)}static credentialFromError(e){return ln.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ln.credential(e.oauthAccessToken)}catch{return null}}}ln.GITHUB_SIGN_IN_METHOD="github.com";ln.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class un extends Ti{constructor(){super("twitter.com")}static credential(e,t){return Zn._fromParams({providerId:un.PROVIDER_ID,signInMethod:un.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return un.credentialFromTaggedObject(e)}static credentialFromError(e){return un.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:s}=e;if(!t||!s)return null;try{return un.credential(t,s)}catch{return null}}}un.TWITTER_SIGN_IN_METHOD="twitter.com";un.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ms{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,s,r=!1){const i=await mt._fromIdTokenResponse(e,s,r),o=ef(s);return new Ms({user:i,providerId:o,_tokenResponse:s,operationType:t})}static async _forOperation(e,t,s){await e._updateTokensIfNecessary(s,!0);const r=ef(s);return new Ms({user:e,providerId:r,_tokenResponse:s,operationType:t})}}function ef(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Do extends At{constructor(e,t,s,r){super(t.code,t.message),this.operationType=s,this.user=r,Object.setPrototypeOf(this,Do.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,t,s,r){return new Do(e,t,s,r)}}function U_(n,e,t,s){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Do._fromErrorAndOperation(n,i,e,s):i})}async function Bw(n,e,t=!1){const s=await ei(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Ms._forOperation(n,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qw(n,e,t=!1){const{auth:s}=n;if(Ke(s.app))return Promise.reject(yn(s));const r="reauthenticate";try{const i=await ei(n,U_(s,r,e,n),t);$(i.idToken,s,"internal-error");const o=pa(i.idToken);$(o,s,"internal-error");const{sub:c}=o;return $(n.uid===c,s,"user-mismatch"),Ms._forOperation(n,r,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Lt(s,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $w(n,e,t=!1){if(Ke(n.app))return Promise.reject(yn(n));const s="signIn",r=await U_(n,s,e),i=await Ms._fromIdTokenResponse(n,s,r);return t||await n._updateCurrentUser(i.user),i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jw(n){var r,i;if(!n)return null;const{providerId:e}=n,t=n.rawUserInfo?JSON.parse(n.rawUserInfo):{},s=n.isNewUser||n.kind==="identitytoolkit#SignupNewUserResponse";if(!e&&(n!=null&&n.idToken)){const o=(i=(r=pa(n.idToken))==null?void 0:r.firebase)==null?void 0:i.sign_in_provider;if(o){const c=o!=="anonymous"&&o!=="custom"?o:null;return new Ps(s,c)}}if(!e)return null;switch(e){case"facebook.com":return new Ww(s,t);case"github.com":return new Hw(s,t);case"google.com":return new zw(s,t);case"twitter.com":return new Gw(s,t,n.screenName||null);case"custom":case"anonymous":return new Ps(s,null);default:return new Ps(s,e,t)}}class Ps{constructor(e,t,s={}){this.isNewUser=e,this.providerId=t,this.profile=s}}class B_ extends Ps{constructor(e,t,s,r){super(e,t,s),this.username=r}}class Ww extends Ps{constructor(e,t){super(e,"facebook.com",t)}}class Hw extends B_{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class zw extends Ps{constructor(e,t){super(e,"google.com",t)}}class Gw extends B_{constructor(e,t,s){super(e,"twitter.com",t,s)}}function DD(n){const{user:e,_tokenResponse:t}=n;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:jw(t)}function Kw(n,e,t,s){return j(n).onIdTokenChanged(e,t,s)}function Qw(n,e,t){return j(n).beforeAuthStateChanged(e,t)}function OD(n,e,t,s){return j(n).onAuthStateChanged(e,t,s)}function xD(n){return j(n).signOut()}const Oo="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q_{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Oo,"1"),this.storage.removeItem(Oo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yw=1e3,Xw=10;class $_ extends q_{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=M_(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const s=this.storage.getItem(t),r=this.localCache[t];s!==r&&e(t,r,s)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,l)=>{this.notifyListeners(o,l)});return}const s=e.key;t?this.detachListener():this.stopPolling();const r=()=>{const o=this.storage.getItem(s);!t&&this.localCache[s]===o||this.notifyListeners(s,o)},i=this.storage.getItem(s);Aw()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,Xw):r()}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:s}),!0)})},Yw)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}$_.type="LOCAL";const Jw=$_;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j_ extends q_{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}j_.type="SESSION";const W_=j_;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zw(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ma{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(r=>r.isListeningto(e));if(t)return t;const s=new ma(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:s,eventType:r,data:i}=t.data,o=this.handlersMap[r];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:s,eventType:r});const c=Array.from(o).map(async u=>u(t.origin,i)),l=await Zw(c);t.ports[0].postMessage({status:"done",eventId:s,eventType:r,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ma.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eu(n="",e=10){let t="";for(let s=0;s<e;s++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eI{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,s=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,o;return new Promise((c,l)=>{const u=eu("",20);r.port1.start();const d=setTimeout(()=>{l(new Error("unsupported_event"))},s);o={messageChannel:r,onMessage(p){const _=p;if(_.data.eventId===u)switch(_.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(_.data.response);break;default:clearTimeout(d),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(o),r.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[r.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dt(){return window}function tI(n){Dt().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function H_(){return typeof Dt().WorkerGlobalScope<"u"&&typeof Dt().importScripts=="function"}async function nI(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function sI(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function rI(){return H_()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const z_="firebaseLocalStorageDb",iI=1,xo="firebaseLocalStorage",G_="fbase_key";class vi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function ga(n,e){return n.transaction([xo],e?"readwrite":"readonly").objectStore(xo)}function oI(){const n=indexedDB.deleteDatabase(z_);return new vi(n).toPromise()}function al(){const n=indexedDB.open(z_,iI);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const s=n.result;try{s.createObjectStore(xo,{keyPath:G_})}catch(r){t(r)}}),n.addEventListener("success",async()=>{const s=n.result;s.objectStoreNames.contains(xo)?e(s):(s.close(),await oI(),e(await al()))})})}async function tf(n,e,t){const s=ga(n,!0).put({[G_]:e,value:t});return new vi(s).toPromise()}async function aI(n,e){const t=ga(n,!1).get(e),s=await new vi(t).toPromise();return s===void 0?null:s.value}function nf(n,e){const t=ga(n,!0).delete(e);return new vi(t).toPromise()}const cI=800,lI=3;class K_{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await al(),this.db)}async _withRetries(e){let t=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(t++>lI)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return H_()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ma._getInstance(rI()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,s;if(this.activeServiceWorker=await nI(),!this.activeServiceWorker)return;this.sender=new eI(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(s=e[0])!=null&&s.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||sI()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await al();return await tf(e,Oo,"1"),await nf(e,Oo),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(s=>tf(s,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(s=>aI(s,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>nf(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const i=ga(r,!1).getAll();return new vi(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],s=new Set;if(e.length!==0)for(const{fbase_key:r,value:i}of e)s.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),t.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!s.has(r)&&(this.notifyListeners(r,null),t.push(r));return t}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),cI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}K_.type="LOCAL";const uI=K_;new Ei(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tu(n,e){return e?$t(e):($(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nu extends F_{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return bs(e,this._buildIdpRequest())}_linkToIdToken(e,t){return bs(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return bs(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function hI(n){return $w(n.auth,new nu(n),n.bypassAuthState)}function dI(n){const{auth:e,user:t}=n;return $(t,e,"internal-error"),qw(t,new nu(n),n.bypassAuthState)}async function fI(n){const{auth:e,user:t}=n;return $(t,e,"internal-error"),Bw(t,new nu(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q_{constructor(e,t,s,r,i=!1){this.auth=e,this.resolver=s,this.user=r,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:s,postBody:r,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const l={auth:this.auth,requestUri:t,sessionId:s,tenantId:i||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return hI;case"linkViaPopup":case"linkViaRedirect":return fI;case"reauthViaPopup":case"reauthViaRedirect":return dI;default:Lt(this.auth,"internal-error")}}resolve(e){Kt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Kt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pI=new Ei(2e3,1e4);async function MD(n,e,t){if(Ke(n.app))return Promise.reject(yt(n,"operation-not-supported-in-this-environment"));const s=nr(n);w_(n,e,_a);const r=tu(s,t);return new Kn(s,"signInViaPopup",e,r).executeNotNull()}class Kn extends Q_{constructor(e,t,s,r,i){super(e,t,r,i),this.provider=s,this.authWindow=null,this.pollId=null,Kn.currentPopupAction&&Kn.currentPopupAction.cancel(),Kn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return $(e,this.auth,"internal-error"),e}async onExecution(){Kt(this.filter.length===1,"Popup operations only handle one event");const e=eu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(yt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(yt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Kn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,s;if((s=(t=this.authWindow)==null?void 0:t.window)!=null&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(yt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,pI.get())};e()}}Kn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _I="pendingRedirect",mo=new Map;class mI extends Q_{constructor(e,t,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,s),this.eventId=null}async execute(){let e=mo.get(this.auth._key());if(!e){try{const s=await gI(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(t){e=()=>Promise.reject(t)}mo.set(this.auth._key(),e)}return this.bypassAuthState||mo.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function gI(n,e){const t=X_(e),s=Y_(n);if(!await s._isAvailable())return!1;const r=await s._get(t)==="true";return await s._remove(t),r}async function yI(n,e){return Y_(n)._set(X_(e),"true")}function EI(n,e){mo.set(n._key(),e)}function Y_(n){return $t(n._redirectPersistence)}function X_(n){return _o(_I,n.config.apiKey,n.name)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function VD(n,e,t){return TI(n,e,t)}async function TI(n,e,t){if(Ke(n.app))return Promise.reject(yn(n));const s=nr(n);w_(n,e,_a),await s._initializationPromise;const r=tu(s,t);return await yI(r,s),r._openRedirect(s,e,"signInViaRedirect")}async function LD(n,e){return await nr(n)._initializationPromise,J_(n,e,!1)}async function J_(n,e,t=!1){if(Ke(n.app))return Promise.reject(yn(n));const s=nr(n),r=tu(s,e),o=await new mI(s,r,t).execute();return o&&!t&&(delete o.user._redirectEventId,await s._persistUserIfCurrent(o.user),await s._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vI=10*60*1e3;class wI{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(t=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!II(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var s;if(e.error&&!Z_(e)){const r=((s=e.error.code)==null?void 0:s.split("auth/")[1])||"internal-error";t.onError(yt(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const s=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=vI&&this.cachedEventUids.clear(),this.cachedEventUids.has(sf(e))}saveEventToCache(e){this.cachedEventUids.add(sf(e)),this.lastProcessedEventTime=Date.now()}}function sf(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Z_({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function II(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Z_(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function AI(n,e={}){return tr(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CI=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,RI=/^https?/;async function SI(n){if(n.config.emulator)return;const{authorizedDomains:e}=await AI(n);for(const t of e)try{if(bI(t))return}catch{}Lt(n,"unauthorized-domain")}function bI(n){const e=il(),{protocol:t,hostname:s}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&s===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===s}if(!RI.test(t))return!1;if(CI.test(n))return s===n;const r=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PI=new Ei(3e4,6e4);function rf(){const n=Dt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function kI(n){return new Promise((e,t)=>{var r,i,o;function s(){rf(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{rf(),t(yt(n,"network-request-failed"))},timeout:PI.get()})}if((i=(r=Dt().gapi)==null?void 0:r.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=Dt().gapi)!=null&&o.load)s();else{const c=Ow("iframefcb");return Dt()[c]=()=>{gapi.load?s():t(yt(n,"network-request-failed"))},Nw(`${Dw()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw go=null,e})}let go=null;function NI(n){return go=go||kI(n),go}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DI=new Ei(5e3,15e3),OI="__/auth/iframe",xI="emulator/auth/iframe",MI={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},VI=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function LI(n){const e=n.config;$(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Yl(e,xI):`https://${n.config.authDomain}/${OI}`,s={apiKey:e.apiKey,appName:n.name,v:Vn},r=VI.get(n.config.apiHost);r&&(s.eid=r);const i=n._getFrameworks();return i.length&&(s.fw=i.join(",")),`${t}?${Zs(s).slice(1)}`}async function FI(n){const e=await NI(n),t=Dt().gapi;return $(t,n,"internal-error"),e.open({where:document.body,url:LI(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:MI,dontclear:!0},s=>new Promise(async(r,i)=>{await s.restyle({setHideOnLeave:!1});const o=yt(n,"network-request-failed"),c=Dt().setTimeout(()=>{i(o)},DI.get());function l(){Dt().clearTimeout(c),r(s)}s.ping(l).then(l,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const UI={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},BI=500,qI=600,$I="_blank",jI="http://localhost";class of{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function WI(n,e,t,s=BI,r=qI){const i=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-s)/2,0).toString();let c="";const l={...UI,width:s.toString(),height:r.toString(),top:i,left:o},u=$e().toLowerCase();t&&(c=k_(u)?$I:t),b_(u)&&(e=e||jI,l.scrollbars="yes");const d=Object.entries(l).reduce((_,[E,C])=>`${_}${E}=${C},`,"");if(Iw(u)&&c!=="_self")return HI(e||"",c),new of(null);const p=window.open(e||"",c,d);$(p,n,"popup-blocked");try{p.focus()}catch{}return new of(p)}function HI(n,e){const t=document.createElement("a");t.href=n,t.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zI="__/auth/handler",GI="emulator/auth/handler",KI=encodeURIComponent("fac");async function af(n,e,t,s,r,i){$(n.config.authDomain,n,"auth-domain-config-required"),$(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:s,v:Vn,eventId:r};if(e instanceof _a){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Ro(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries({}))o[d]=p}if(e instanceof Ti){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(o.scopes=d.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const d of Object.keys(c))c[d]===void 0&&delete c[d];const l=await n._getAppCheckToken(),u=l?`#${KI}=${encodeURIComponent(l)}`:"";return`${QI(n)}?${Zs(c).slice(1)}${u}`}function QI({config:n}){return n.emulator?Yl(n,GI):`https://${n.authDomain}/${zI}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mc="webStorageSupport";class YI{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=W_,this._completeRedirectFn=J_,this._overrideRedirectResult=EI}async _openPopup(e,t,s,r){var o;Kt((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await af(e,t,s,il(),r);return WI(e,i,eu())}async _openRedirect(e,t,s,r){await this._originValidation(e);const i=await af(e,t,s,il(),r);return tI(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:r,promise:i}=this.eventManagers[t];return r?Promise.resolve(r):(Kt(i,"If manager is not set, promise should be"),i)}const s=this.initAndGetManager(e);return this.eventManagers[t]={promise:s},s.catch(()=>{delete this.eventManagers[t]}),s}async initAndGetManager(e){const t=await FI(e),s=new wI(e);return t.register("authEvent",r=>($(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:s.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=t,s}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Mc,{type:Mc},r=>{var o;const i=(o=r==null?void 0:r[0])==null?void 0:o[Mc];i!==void 0&&t(!!i),Lt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=SI(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return M_()||P_()||Jl()}}const XI=YI;var cf="@firebase/auth",lf="1.11.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JI{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){$(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZI(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function eA(n){wt(new dt("auth",(e,{options:t})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=s.options;$(o&&!o.includes(":"),"invalid-api-key",{appName:s.name});const l={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:V_(n)},u=new Pw(s,r,i,l);return Mw(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,s)=>{e.getProvider("auth-internal").initialize()})),wt(new dt("auth-internal",e=>{const t=nr(e.getProvider("auth").getImmediate());return(s=>new JI(s))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ye(cf,lf,ZI(n)),Ye(cf,lf,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tA=5*60,nA=f_("authIdTokenMaxAge")||tA;let uf=null;const sA=n=>async e=>{const t=e&&await e.getIdTokenResult(),s=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(s&&s>nA)return;const r=t==null?void 0:t.token;uf!==r&&(uf=r,await fetch(n,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function FD(n=er()){const e=Mn(n,"auth");if(e.isInitialized())return e.getImmediate();const t=xw(n,{popupRedirectResolver:XI,persistence:[uI,Jw,W_]}),s=f_("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(s,location.origin);if(location.origin===i.origin){const o=sA(i.toString());Qw(t,o,()=>o(t.currentUser)),Kw(t,c=>o(c))}}const r=h_("auth");return r&&Vw(t,`http://${r}`),t}function rA(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}kw({loadJS(n){return new Promise((e,t)=>{const s=document.createElement("script");s.setAttribute("src",n),s.onload=e,s.onerror=r=>{const i=yt("internal-error");i.customData=r,t(i)},s.type="text/javascript",s.charset="UTF-8",rA().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});eA("Browser");var iA="firebase",oA="12.4.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ye(iA,oA,"app");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cl=new Map,em={activated:!1,tokenObservers:[]},aA={initialized:!1,enabled:!1};function Re(n){return cl.get(n)||{...em}}function cA(n,e){return cl.set(n,e),cl.get(n)}function ya(){return aA}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tm="https://content-firebaseappcheck.googleapis.com/v1",lA="exchangeRecaptchaV3Token",uA="exchangeDebugToken",hf={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:16*60*1e3},hA=24*60*60*1e3;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dA{constructor(e,t,s,r,i){if(this.operation=e,this.retryPolicy=t,this.getWaitDuration=s,this.lowerBound=r,this.upperBound=i,this.pending=null,this.nextErrorWaitInterval=r,r>i)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(e){this.stop();try{this.pending=new Ge,this.pending.promise.catch(t=>{}),await fA(this.getNextRun(e)),this.pending.resolve(),await this.pending.promise,this.pending=new Ge,this.pending.promise.catch(t=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(t){this.retryPolicy(t)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(e){if(e)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const t=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),t}}}function fA(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pA={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},nt=new Js("appCheck","AppCheck",pA);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function df(n=!1){var e;return n?(e=self.grecaptcha)==null?void 0:e.enterprise:self.grecaptcha}function su(n){if(!Re(n).activated)throw nt.create("use-before-activation",{appName:n.name})}function nm(n){const e=Math.round(n/1e3),t=Math.floor(e/(3600*24)),s=Math.floor((e-t*3600*24)/3600),r=Math.floor((e-t*3600*24-s*3600)/60),i=e-t*3600*24-s*3600-r*60;let o="";return t&&(o+=no(t)+"d:"),s&&(o+=no(s)+"h:"),o+=no(r)+"m:"+no(i)+"s",o}function no(n){return n===0?"00":n>=10?n.toString():"0"+n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ru({url:n,body:e},t){const s={"Content-Type":"application/json"},r=t.getImmediate({optional:!0});if(r){const p=await r.getHeartbeatsHeader();p&&(s["X-Firebase-Client"]=p)}const i={method:"POST",body:JSON.stringify(e),headers:s};let o;try{o=await fetch(n,i)}catch(p){throw nt.create("fetch-network-error",{originalErrorMessage:p==null?void 0:p.message})}if(o.status!==200)throw nt.create("fetch-status-error",{httpStatus:o.status});let c;try{c=await o.json()}catch(p){throw nt.create("fetch-parse-error",{originalErrorMessage:p==null?void 0:p.message})}const l=c.ttl.match(/^([\d.]+)(s)$/);if(!l||!l[2]||isNaN(Number(l[1])))throw nt.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${c.ttl}`});const u=Number(l[1])*1e3,d=Date.now();return{token:c.token,expireTimeMillis:d+u,issuedAtTimeMillis:d}}function _A(n,e){const{projectId:t,appId:s,apiKey:r}=n.options;return{url:`${tm}/projects/${t}/apps/${s}:${lA}?key=${r}`,body:{recaptcha_v3_token:e}}}function sm(n,e){const{projectId:t,appId:s,apiKey:r}=n.options;return{url:`${tm}/projects/${t}/apps/${s}:${uA}?key=${r}`,body:{debug_token:e}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mA="firebase-app-check-database",gA=1,ti="firebase-app-check-store",rm="debug-token";let so=null;function im(){return so||(so=new Promise((n,e)=>{try{const t=indexedDB.open(mA,gA);t.onsuccess=s=>{n(s.target.result)},t.onerror=s=>{var r;e(nt.create("storage-open",{originalErrorMessage:(r=s.target.error)==null?void 0:r.message}))},t.onupgradeneeded=s=>{const r=s.target.result;switch(s.oldVersion){case 0:r.createObjectStore(ti,{keyPath:"compositeKey"})}}}catch(t){e(nt.create("storage-open",{originalErrorMessage:t==null?void 0:t.message}))}}),so)}function yA(n){return am(cm(n))}function EA(n,e){return om(cm(n),e)}function TA(n){return om(rm,n)}function vA(){return am(rm)}async function om(n,e){const s=(await im()).transaction(ti,"readwrite"),i=s.objectStore(ti).put({compositeKey:n,value:e});return new Promise((o,c)=>{i.onsuccess=l=>{o()},s.onerror=l=>{var u;c(nt.create("storage-set",{originalErrorMessage:(u=l.target.error)==null?void 0:u.message}))}})}async function am(n){const t=(await im()).transaction(ti,"readonly"),r=t.objectStore(ti).get(n);return new Promise((i,o)=>{r.onsuccess=c=>{const l=c.target.result;i(l?l.value:void 0)},t.onerror=c=>{var l;o(nt.create("storage-get",{originalErrorMessage:(l=c.target.error)==null?void 0:l.message}))}})}function cm(n){return`${n.options.appId}-${n.name}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn=new yi("@firebase/app-check");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wA(n){if(zl()){let e;try{e=await yA(n)}catch(t){dn.warn(`Failed to read token from IndexedDB. Error: ${t}`)}return e}}function Vc(n,e){return zl()?EA(n,e).catch(t=>{dn.warn(`Failed to write token to IndexedDB. Error: ${t}`)}):Promise.resolve()}async function IA(){let n;try{n=await vA()}catch{}if(n)return n;{const e=crypto.randomUUID();return TA(e).catch(t=>dn.warn(`Failed to persist debug token to IndexedDB. Error: ${t}`)),e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iu(){return ya().enabled}async function ou(){const n=ya();if(n.enabled&&n.token)return n.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function AA(){const n=u_(),e=ya();if(e.initialized=!0,typeof n.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&n.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;e.enabled=!0;const t=new Ge;e.token=t,typeof n.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?t.resolve(n.FIREBASE_APPCHECK_DEBUG_TOKEN):t.resolve(IA())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CA={error:"UNKNOWN_ERROR"};function RA(n){return ua.encodeString(JSON.stringify(n),!1)}async function ll(n,e=!1,t=!1){const s=n.app;su(s);const r=Re(s);let i=r.token,o;if(i&&!Is(i)&&(r.token=void 0,i=void 0),!i){const u=await r.cachedTokenPromise;u&&(Is(u)?i=u:await Vc(s,void 0))}if(!e&&i&&Is(i))return{token:i.token};let c=!1;if(iu())try{r.exchangeTokenPromise||(r.exchangeTokenPromise=ru(sm(s,await ou()),n.heartbeatServiceProvider).finally(()=>{r.exchangeTokenPromise=void 0}),c=!0);const u=await r.exchangeTokenPromise;return await Vc(s,u),r.token=u,{token:u.token}}catch(u){return u.code==="appCheck/throttled"||u.code==="appCheck/initial-throttle"?dn.warn(u.message):t&&dn.error(u),Lc(u)}try{r.exchangeTokenPromise||(r.exchangeTokenPromise=r.provider.getToken().finally(()=>{r.exchangeTokenPromise=void 0}),c=!0),i=await Re(s).exchangeTokenPromise}catch(u){u.code==="appCheck/throttled"||u.code==="appCheck/initial-throttle"?dn.warn(u.message):t&&dn.error(u),o=u}let l;return i?o?Is(i)?l={token:i.token,internalError:o}:l=Lc(o):(l={token:i.token},r.token=i,await Vc(s,i)):l=Lc(o),c&&hm(s,l),l}async function SA(n){const e=n.app;su(e);const{provider:t}=Re(e);if(iu()){const s=await ou(),{token:r}=await ru(sm(e,s),n.heartbeatServiceProvider);return{token:r}}else{const{token:s}=await t.getToken();return{token:s}}}function lm(n,e,t,s){const{app:r}=n,i=Re(r),o={next:t,error:s,type:e};if(i.tokenObservers=[...i.tokenObservers,o],i.token&&Is(i.token)){const c=i.token;Promise.resolve().then(()=>{t({token:c.token}),ff(n)}).catch(()=>{})}i.cachedTokenPromise.then(()=>ff(n))}function um(n,e){const t=Re(n),s=t.tokenObservers.filter(r=>r.next!==e);s.length===0&&t.tokenRefresher&&t.tokenRefresher.isRunning()&&t.tokenRefresher.stop(),t.tokenObservers=s}function ff(n){const{app:e}=n,t=Re(e);let s=t.tokenRefresher;s||(s=bA(n),t.tokenRefresher=s),!s.isRunning()&&t.isTokenAutoRefreshEnabled&&s.start()}function bA(n){const{app:e}=n;return new dA(async()=>{const t=Re(e);let s;if(t.token?s=await ll(n,!0):s=await ll(n),s.error)throw s.error;if(s.internalError)throw s.internalError},()=>!0,()=>{const t=Re(e);if(t.token){let s=t.token.issuedAtTimeMillis+(t.token.expireTimeMillis-t.token.issuedAtTimeMillis)*.5+3e5;const r=t.token.expireTimeMillis-5*60*1e3;return s=Math.min(s,r),Math.max(0,s-Date.now())}else return 0},hf.RETRIAL_MIN_WAIT,hf.RETRIAL_MAX_WAIT)}function hm(n,e){const t=Re(n).tokenObservers;for(const s of t)try{s.type==="EXTERNAL"&&e.error!=null?s.error(e.error):s.next(e)}catch{}}function Is(n){return n.expireTimeMillis-Date.now()>0}function Lc(n){return{token:RA(CA),error:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PA{constructor(e,t){this.app=e,this.heartbeatServiceProvider=t}_delete(){const{tokenObservers:e}=Re(this.app);for(const t of e)um(this.app,t.next);return Promise.resolve()}}function kA(n,e){return new PA(n,e)}function NA(n){return{getToken:e=>ll(n,e),getLimitedUseToken:()=>SA(n),addTokenListener:e=>lm(n,"INTERNAL",e),removeTokenListener:e=>um(n.app,e)}}const DA="@firebase/app-check",OA="0.11.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xA="https://www.google.com/recaptcha/api.js";function MA(n,e){const t=new Ge,s=Re(n);s.reCAPTCHAState={initialized:t};const r=VA(n),i=df(!1);return i?pf(n,e,i,r,t):UA(()=>{const o=df(!1);if(!o)throw new Error("no recaptcha");pf(n,e,o,r,t)}),t.promise}function pf(n,e,t,s,r){t.ready(()=>{FA(n,e,t,s),r.resolve(t)})}function VA(n){const e=`fire_app_check_${n.name}`,t=document.createElement("div");return t.id=e,t.style.display="none",document.body.appendChild(t),e}async function LA(n){su(n);const t=await Re(n).reCAPTCHAState.initialized.promise;return new Promise((s,r)=>{const i=Re(n).reCAPTCHAState;t.ready(()=>{s(t.execute(i.widgetId,{action:"fire_app_check"}))})})}function FA(n,e,t,s){const r=t.render(s,{sitekey:e,size:"invisible",callback:()=>{Re(n).reCAPTCHAState.succeeded=!0},"error-callback":()=>{Re(n).reCAPTCHAState.succeeded=!1}}),i=Re(n);i.reCAPTCHAState={...i.reCAPTCHAState,widgetId:r}}function UA(n){const e=document.createElement("script");e.src=xA,e.onload=n,document.head.appendChild(e)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dm{constructor(e){this._siteKey=e,this._throttleData=null}async getToken(){var s,r,i;qA(this._throttleData);const e=await LA(this._app).catch(o=>{throw nt.create("recaptcha-error")});if(!((s=Re(this._app).reCAPTCHAState)!=null&&s.succeeded))throw nt.create("recaptcha-error");let t;try{t=await ru(_A(this._app,e),this._heartbeatServiceProvider)}catch(o){throw(r=o.code)!=null&&r.includes("fetch-status-error")?(this._throttleData=BA(Number((i=o.customData)==null?void 0:i.httpStatus),this._throttleData),nt.create("initial-throttle",{time:nm(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):o}return this._throttleData=null,t}initialize(e){this._app=e,this._heartbeatServiceProvider=Mn(e,"heartbeat"),MA(e,this._siteKey).catch(()=>{})}isEqual(e){return e instanceof dm?this._siteKey===e._siteKey:!1}}function BA(n,e){if(n===404||n===403)return{backoffCount:1,allowRequestsAfter:Date.now()+hA,httpStatus:n};{const t=e?e.backoffCount:0,s=QT(t,1e3,2);return{backoffCount:t+1,allowRequestsAfter:Date.now()+s,httpStatus:n}}}function qA(n){if(n&&Date.now()-n.allowRequestsAfter<=0)throw nt.create("throttled",{time:nm(n.allowRequestsAfter-Date.now()),httpStatus:n.httpStatus})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function UD(n=er(),e){n=j(n);const t=Mn(n,"app-check");if(ya().initialized||AA(),iu()&&ou().then(r=>console.log(`App Check debug token: ${r}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`)),t.isInitialized()){const r=t.getImmediate(),i=t.getOptions();if(i.isTokenAutoRefreshEnabled===e.isTokenAutoRefreshEnabled&&i.provider.isEqual(e.provider))return r;throw nt.create("already-initialized",{appName:n.name})}const s=t.initialize({options:e});return $A(n,e.provider,e.isTokenAutoRefreshEnabled),Re(n).isTokenAutoRefreshEnabled&&lm(s,"INTERNAL",()=>{}),s}function $A(n,e,t=!1){const s=cA(n,{...em});s.activated=!0,s.provider=e,s.cachedTokenPromise=wA(n).then(r=>(r&&Is(r)&&(s.token=r,hm(n,{token:r.token})),r)),s.isTokenAutoRefreshEnabled=t&&n.automaticDataCollectionEnabled,!n.automaticDataCollectionEnabled&&t&&dn.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."),s.provider.initialize(n)}const jA="app-check",_f="app-check-internal";function WA(){wt(new dt(jA,n=>{const e=n.getProvider("app").getImmediate(),t=n.getProvider("heartbeat");return kA(e,t)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((n,e,t)=>{n.getProvider(_f).initialize()})),wt(new dt(_f,n=>{const e=n.getProvider("app-check").getImmediate();return NA(e)},"PUBLIC").setInstantiationMode("EXPLICIT")),Ye(DA,OA)}WA();var mf=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var En,fm;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(w,g){function T(){}T.prototype=g.prototype,w.F=g.prototype,w.prototype=new T,w.prototype.constructor=w,w.D=function(I,v,R){for(var y=Array(arguments.length-2),Ze=2;Ze<arguments.length;Ze++)y[Ze-2]=arguments[Ze];return g.prototype[v].apply(I,y)}}function t(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(s,t),s.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(w,g,T){T||(T=0);const I=Array(16);if(typeof g=="string")for(var v=0;v<16;++v)I[v]=g.charCodeAt(T++)|g.charCodeAt(T++)<<8|g.charCodeAt(T++)<<16|g.charCodeAt(T++)<<24;else for(v=0;v<16;++v)I[v]=g[T++]|g[T++]<<8|g[T++]<<16|g[T++]<<24;g=w.g[0],T=w.g[1],v=w.g[2];let R=w.g[3],y;y=g+(R^T&(v^R))+I[0]+3614090360&4294967295,g=T+(y<<7&4294967295|y>>>25),y=R+(v^g&(T^v))+I[1]+3905402710&4294967295,R=g+(y<<12&4294967295|y>>>20),y=v+(T^R&(g^T))+I[2]+606105819&4294967295,v=R+(y<<17&4294967295|y>>>15),y=T+(g^v&(R^g))+I[3]+3250441966&4294967295,T=v+(y<<22&4294967295|y>>>10),y=g+(R^T&(v^R))+I[4]+4118548399&4294967295,g=T+(y<<7&4294967295|y>>>25),y=R+(v^g&(T^v))+I[5]+1200080426&4294967295,R=g+(y<<12&4294967295|y>>>20),y=v+(T^R&(g^T))+I[6]+2821735955&4294967295,v=R+(y<<17&4294967295|y>>>15),y=T+(g^v&(R^g))+I[7]+4249261313&4294967295,T=v+(y<<22&4294967295|y>>>10),y=g+(R^T&(v^R))+I[8]+1770035416&4294967295,g=T+(y<<7&4294967295|y>>>25),y=R+(v^g&(T^v))+I[9]+2336552879&4294967295,R=g+(y<<12&4294967295|y>>>20),y=v+(T^R&(g^T))+I[10]+4294925233&4294967295,v=R+(y<<17&4294967295|y>>>15),y=T+(g^v&(R^g))+I[11]+2304563134&4294967295,T=v+(y<<22&4294967295|y>>>10),y=g+(R^T&(v^R))+I[12]+1804603682&4294967295,g=T+(y<<7&4294967295|y>>>25),y=R+(v^g&(T^v))+I[13]+4254626195&4294967295,R=g+(y<<12&4294967295|y>>>20),y=v+(T^R&(g^T))+I[14]+2792965006&4294967295,v=R+(y<<17&4294967295|y>>>15),y=T+(g^v&(R^g))+I[15]+1236535329&4294967295,T=v+(y<<22&4294967295|y>>>10),y=g+(v^R&(T^v))+I[1]+4129170786&4294967295,g=T+(y<<5&4294967295|y>>>27),y=R+(T^v&(g^T))+I[6]+3225465664&4294967295,R=g+(y<<9&4294967295|y>>>23),y=v+(g^T&(R^g))+I[11]+643717713&4294967295,v=R+(y<<14&4294967295|y>>>18),y=T+(R^g&(v^R))+I[0]+3921069994&4294967295,T=v+(y<<20&4294967295|y>>>12),y=g+(v^R&(T^v))+I[5]+3593408605&4294967295,g=T+(y<<5&4294967295|y>>>27),y=R+(T^v&(g^T))+I[10]+38016083&4294967295,R=g+(y<<9&4294967295|y>>>23),y=v+(g^T&(R^g))+I[15]+3634488961&4294967295,v=R+(y<<14&4294967295|y>>>18),y=T+(R^g&(v^R))+I[4]+3889429448&4294967295,T=v+(y<<20&4294967295|y>>>12),y=g+(v^R&(T^v))+I[9]+568446438&4294967295,g=T+(y<<5&4294967295|y>>>27),y=R+(T^v&(g^T))+I[14]+3275163606&4294967295,R=g+(y<<9&4294967295|y>>>23),y=v+(g^T&(R^g))+I[3]+4107603335&4294967295,v=R+(y<<14&4294967295|y>>>18),y=T+(R^g&(v^R))+I[8]+1163531501&4294967295,T=v+(y<<20&4294967295|y>>>12),y=g+(v^R&(T^v))+I[13]+2850285829&4294967295,g=T+(y<<5&4294967295|y>>>27),y=R+(T^v&(g^T))+I[2]+4243563512&4294967295,R=g+(y<<9&4294967295|y>>>23),y=v+(g^T&(R^g))+I[7]+1735328473&4294967295,v=R+(y<<14&4294967295|y>>>18),y=T+(R^g&(v^R))+I[12]+2368359562&4294967295,T=v+(y<<20&4294967295|y>>>12),y=g+(T^v^R)+I[5]+4294588738&4294967295,g=T+(y<<4&4294967295|y>>>28),y=R+(g^T^v)+I[8]+2272392833&4294967295,R=g+(y<<11&4294967295|y>>>21),y=v+(R^g^T)+I[11]+1839030562&4294967295,v=R+(y<<16&4294967295|y>>>16),y=T+(v^R^g)+I[14]+4259657740&4294967295,T=v+(y<<23&4294967295|y>>>9),y=g+(T^v^R)+I[1]+2763975236&4294967295,g=T+(y<<4&4294967295|y>>>28),y=R+(g^T^v)+I[4]+1272893353&4294967295,R=g+(y<<11&4294967295|y>>>21),y=v+(R^g^T)+I[7]+4139469664&4294967295,v=R+(y<<16&4294967295|y>>>16),y=T+(v^R^g)+I[10]+3200236656&4294967295,T=v+(y<<23&4294967295|y>>>9),y=g+(T^v^R)+I[13]+681279174&4294967295,g=T+(y<<4&4294967295|y>>>28),y=R+(g^T^v)+I[0]+3936430074&4294967295,R=g+(y<<11&4294967295|y>>>21),y=v+(R^g^T)+I[3]+3572445317&4294967295,v=R+(y<<16&4294967295|y>>>16),y=T+(v^R^g)+I[6]+76029189&4294967295,T=v+(y<<23&4294967295|y>>>9),y=g+(T^v^R)+I[9]+3654602809&4294967295,g=T+(y<<4&4294967295|y>>>28),y=R+(g^T^v)+I[12]+3873151461&4294967295,R=g+(y<<11&4294967295|y>>>21),y=v+(R^g^T)+I[15]+530742520&4294967295,v=R+(y<<16&4294967295|y>>>16),y=T+(v^R^g)+I[2]+3299628645&4294967295,T=v+(y<<23&4294967295|y>>>9),y=g+(v^(T|~R))+I[0]+4096336452&4294967295,g=T+(y<<6&4294967295|y>>>26),y=R+(T^(g|~v))+I[7]+1126891415&4294967295,R=g+(y<<10&4294967295|y>>>22),y=v+(g^(R|~T))+I[14]+2878612391&4294967295,v=R+(y<<15&4294967295|y>>>17),y=T+(R^(v|~g))+I[5]+4237533241&4294967295,T=v+(y<<21&4294967295|y>>>11),y=g+(v^(T|~R))+I[12]+1700485571&4294967295,g=T+(y<<6&4294967295|y>>>26),y=R+(T^(g|~v))+I[3]+2399980690&4294967295,R=g+(y<<10&4294967295|y>>>22),y=v+(g^(R|~T))+I[10]+4293915773&4294967295,v=R+(y<<15&4294967295|y>>>17),y=T+(R^(v|~g))+I[1]+2240044497&4294967295,T=v+(y<<21&4294967295|y>>>11),y=g+(v^(T|~R))+I[8]+1873313359&4294967295,g=T+(y<<6&4294967295|y>>>26),y=R+(T^(g|~v))+I[15]+4264355552&4294967295,R=g+(y<<10&4294967295|y>>>22),y=v+(g^(R|~T))+I[6]+2734768916&4294967295,v=R+(y<<15&4294967295|y>>>17),y=T+(R^(v|~g))+I[13]+1309151649&4294967295,T=v+(y<<21&4294967295|y>>>11),y=g+(v^(T|~R))+I[4]+4149444226&4294967295,g=T+(y<<6&4294967295|y>>>26),y=R+(T^(g|~v))+I[11]+3174756917&4294967295,R=g+(y<<10&4294967295|y>>>22),y=v+(g^(R|~T))+I[2]+718787259&4294967295,v=R+(y<<15&4294967295|y>>>17),y=T+(R^(v|~g))+I[9]+3951481745&4294967295,w.g[0]=w.g[0]+g&4294967295,w.g[1]=w.g[1]+(v+(y<<21&4294967295|y>>>11))&4294967295,w.g[2]=w.g[2]+v&4294967295,w.g[3]=w.g[3]+R&4294967295}s.prototype.v=function(w,g){g===void 0&&(g=w.length);const T=g-this.blockSize,I=this.C;let v=this.h,R=0;for(;R<g;){if(v==0)for(;R<=T;)r(this,w,R),R+=this.blockSize;if(typeof w=="string"){for(;R<g;)if(I[v++]=w.charCodeAt(R++),v==this.blockSize){r(this,I),v=0;break}}else for(;R<g;)if(I[v++]=w[R++],v==this.blockSize){r(this,I),v=0;break}}this.h=v,this.o+=g},s.prototype.A=function(){var w=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);w[0]=128;for(var g=1;g<w.length-8;++g)w[g]=0;g=this.o*8;for(var T=w.length-8;T<w.length;++T)w[T]=g&255,g/=256;for(this.v(w),w=Array(16),g=0,T=0;T<4;++T)for(let I=0;I<32;I+=8)w[g++]=this.g[T]>>>I&255;return w};function i(w,g){var T=c;return Object.prototype.hasOwnProperty.call(T,w)?T[w]:T[w]=g(w)}function o(w,g){this.h=g;const T=[];let I=!0;for(let v=w.length-1;v>=0;v--){const R=w[v]|0;I&&R==g||(T[v]=R,I=!1)}this.g=T}var c={};function l(w){return-128<=w&&w<128?i(w,function(g){return new o([g|0],g<0?-1:0)}):new o([w|0],w<0?-1:0)}function u(w){if(isNaN(w)||!isFinite(w))return p;if(w<0)return b(u(-w));const g=[];let T=1;for(let I=0;w>=T;I++)g[I]=w/T|0,T*=4294967296;return new o(g,0)}function d(w,g){if(w.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(w.charAt(0)=="-")return b(d(w.substring(1),g));if(w.indexOf("-")>=0)throw Error('number format error: interior "-" character');const T=u(Math.pow(g,8));let I=p;for(let R=0;R<w.length;R+=8){var v=Math.min(8,w.length-R);const y=parseInt(w.substring(R,R+v),g);v<8?(v=u(Math.pow(g,v)),I=I.j(v).add(u(y))):(I=I.j(T),I=I.add(u(y)))}return I}var p=l(0),_=l(1),E=l(16777216);n=o.prototype,n.m=function(){if(k(this))return-b(this).m();let w=0,g=1;for(let T=0;T<this.g.length;T++){const I=this.i(T);w+=(I>=0?I:4294967296+I)*g,g*=4294967296}return w},n.toString=function(w){if(w=w||10,w<2||36<w)throw Error("radix out of range: "+w);if(C(this))return"0";if(k(this))return"-"+b(this).toString(w);const g=u(Math.pow(w,6));var T=this;let I="";for(;;){const v=K(T,g).g;T=V(T,v.j(g));let R=((T.g.length>0?T.g[0]:T.h)>>>0).toString(w);if(T=v,C(T))return R+I;for(;R.length<6;)R="0"+R;I=R+I}},n.i=function(w){return w<0?0:w<this.g.length?this.g[w]:this.h};function C(w){if(w.h!=0)return!1;for(let g=0;g<w.g.length;g++)if(w.g[g]!=0)return!1;return!0}function k(w){return w.h==-1}n.l=function(w){return w=V(this,w),k(w)?-1:C(w)?0:1};function b(w){const g=w.g.length,T=[];for(let I=0;I<g;I++)T[I]=~w.g[I];return new o(T,~w.h).add(_)}n.abs=function(){return k(this)?b(this):this},n.add=function(w){const g=Math.max(this.g.length,w.g.length),T=[];let I=0;for(let v=0;v<=g;v++){let R=I+(this.i(v)&65535)+(w.i(v)&65535),y=(R>>>16)+(this.i(v)>>>16)+(w.i(v)>>>16);I=y>>>16,R&=65535,y&=65535,T[v]=y<<16|R}return new o(T,T[T.length-1]&-2147483648?-1:0)};function V(w,g){return w.add(b(g))}n.j=function(w){if(C(this)||C(w))return p;if(k(this))return k(w)?b(this).j(b(w)):b(b(this).j(w));if(k(w))return b(this.j(b(w)));if(this.l(E)<0&&w.l(E)<0)return u(this.m()*w.m());const g=this.g.length+w.g.length,T=[];for(var I=0;I<2*g;I++)T[I]=0;for(I=0;I<this.g.length;I++)for(let v=0;v<w.g.length;v++){const R=this.i(I)>>>16,y=this.i(I)&65535,Ze=w.i(v)>>>16,Bn=w.i(v)&65535;T[2*I+2*v]+=y*Bn,F(T,2*I+2*v),T[2*I+2*v+1]+=R*Bn,F(T,2*I+2*v+1),T[2*I+2*v+1]+=y*Ze,F(T,2*I+2*v+1),T[2*I+2*v+2]+=R*Ze,F(T,2*I+2*v+2)}for(w=0;w<g;w++)T[w]=T[2*w+1]<<16|T[2*w];for(w=g;w<2*g;w++)T[w]=0;return new o(T,0)};function F(w,g){for(;(w[g]&65535)!=w[g];)w[g+1]+=w[g]>>>16,w[g]&=65535,g++}function U(w,g){this.g=w,this.h=g}function K(w,g){if(C(g))throw Error("division by zero");if(C(w))return new U(p,p);if(k(w))return g=K(b(w),g),new U(b(g.g),b(g.h));if(k(g))return g=K(w,b(g)),new U(b(g.g),g.h);if(w.g.length>30){if(k(w)||k(g))throw Error("slowDivide_ only works with positive integers.");for(var T=_,I=g;I.l(w)<=0;)T=Ee(T),I=Ee(I);var v=ae(T,1),R=ae(I,1);for(I=ae(I,2),T=ae(T,2);!C(I);){var y=R.add(I);y.l(w)<=0&&(v=v.add(T),R=y),I=ae(I,1),T=ae(T,1)}return g=V(w,v.j(g)),new U(v,g)}for(v=p;w.l(g)>=0;){for(T=Math.max(1,Math.floor(w.m()/g.m())),I=Math.ceil(Math.log(T)/Math.LN2),I=I<=48?1:Math.pow(2,I-48),R=u(T),y=R.j(g);k(y)||y.l(w)>0;)T-=I,R=u(T),y=R.j(g);C(R)&&(R=_),v=v.add(R),w=V(w,y)}return new U(v,w)}n.B=function(w){return K(this,w).h},n.and=function(w){const g=Math.max(this.g.length,w.g.length),T=[];for(let I=0;I<g;I++)T[I]=this.i(I)&w.i(I);return new o(T,this.h&w.h)},n.or=function(w){const g=Math.max(this.g.length,w.g.length),T=[];for(let I=0;I<g;I++)T[I]=this.i(I)|w.i(I);return new o(T,this.h|w.h)},n.xor=function(w){const g=Math.max(this.g.length,w.g.length),T=[];for(let I=0;I<g;I++)T[I]=this.i(I)^w.i(I);return new o(T,this.h^w.h)};function Ee(w){const g=w.g.length+1,T=[];for(let I=0;I<g;I++)T[I]=w.i(I)<<1|w.i(I-1)>>>31;return new o(T,w.h)}function ae(w,g){const T=g>>5;g%=32;const I=w.g.length-T,v=[];for(let R=0;R<I;R++)v[R]=g>0?w.i(R+T)>>>g|w.i(R+T+1)<<32-g:w.i(R+T);return new o(v,w.h)}s.prototype.digest=s.prototype.A,s.prototype.reset=s.prototype.u,s.prototype.update=s.prototype.v,fm=s,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=d,En=o}).apply(typeof mf<"u"?mf:typeof self<"u"?self:typeof window<"u"?window:{});var ro=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pm,Lr,_m,yo,ul,mm,gm,ym;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof ro=="object"&&ro];for(var h=0;h<a.length;++h){var f=a[h];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var s=t(this);function r(a,h){if(h)e:{var f=s;a=a.split(".");for(var m=0;m<a.length-1;m++){var A=a[m];if(!(A in f))break e;f=f[A]}a=a[a.length-1],m=f[a],h=h(m),h!=m&&h!=null&&e(f,a,{configurable:!0,writable:!0,value:h})}}r("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(a){return a||function(h){var f=[],m;for(m in h)Object.prototype.hasOwnProperty.call(h,m)&&f.push([m,h[m]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function c(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function l(a,h,f){return a.call.apply(a.bind,arguments)}function u(a,h,f){return u=l,u.apply(null,arguments)}function d(a,h){var f=Array.prototype.slice.call(arguments,1);return function(){var m=f.slice();return m.push.apply(m,arguments),a.apply(this,m)}}function p(a,h){function f(){}f.prototype=h.prototype,a.Z=h.prototype,a.prototype=new f,a.prototype.constructor=a,a.Ob=function(m,A,S){for(var x=Array(arguments.length-2),z=2;z<arguments.length;z++)x[z-2]=arguments[z];return h.prototype[A].apply(m,x)}}var _=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function E(a){const h=a.length;if(h>0){const f=Array(h);for(let m=0;m<h;m++)f[m]=a[m];return f}return[]}function C(a,h){for(let m=1;m<arguments.length;m++){const A=arguments[m];var f=typeof A;if(f=f!="object"?f:A?Array.isArray(A)?"array":f:"null",f=="array"||f=="object"&&typeof A.length=="number"){f=a.length||0;const S=A.length||0;a.length=f+S;for(let x=0;x<S;x++)a[f+x]=A[x]}else a.push(A)}}class k{constructor(h,f){this.i=h,this.j=f,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function b(a){o.setTimeout(()=>{throw a},0)}function V(){var a=w;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class F{constructor(){this.h=this.g=null}add(h,f){const m=U.get();m.set(h,f),this.h?this.h.next=m:this.g=m,this.h=m}}var U=new k(()=>new K,a=>a.reset());class K{constructor(){this.next=this.g=this.h=null}set(h,f){this.h=h,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Ee,ae=!1,w=new F,g=()=>{const a=Promise.resolve(void 0);Ee=()=>{a.then(T)}};function T(){for(var a;a=V();){try{a.h.call(a.g)}catch(f){b(f)}var h=U;h.j(a),h.h<100&&(h.h++,a.next=h.g,h.g=a)}ae=!1}function I(){this.u=this.u,this.C=this.C}I.prototype.u=!1,I.prototype.dispose=function(){this.u||(this.u=!0,this.N())},I.prototype[Symbol.dispose]=function(){this.dispose()},I.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function v(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}v.prototype.h=function(){this.defaultPrevented=!0};var R=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};o.addEventListener("test",f,h),o.removeEventListener("test",f,h)}catch{}return a}();function y(a){return/^[\s\xa0]*$/.test(a)}function Ze(a,h){v.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,h)}p(Ze,v),Ze.prototype.init=function(a,h){const f=this.type=a.type,m=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget,h||(f=="mouseover"?h=a.fromElement:f=="mouseout"&&(h=a.toElement)),this.relatedTarget=h,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&Ze.Z.h.call(this)},Ze.prototype.h=function(){Ze.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Bn="closure_listenable_"+(Math.random()*1e6|0),BE=0;function qE(a,h,f,m,A){this.listener=a,this.proxy=null,this.src=h,this.type=f,this.capture=!!m,this.ha=A,this.key=++BE,this.da=this.fa=!1}function Bi(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function qi(a,h,f){for(const m in a)h.call(f,a[m],m,a)}function $E(a,h){for(const f in a)h.call(void 0,a[f],f,a)}function Mh(a){const h={};for(const f in a)h[f]=a[f];return h}const Vh="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Lh(a,h){let f,m;for(let A=1;A<arguments.length;A++){m=arguments[A];for(f in m)a[f]=m[f];for(let S=0;S<Vh.length;S++)f=Vh[S],Object.prototype.hasOwnProperty.call(m,f)&&(a[f]=m[f])}}function $i(a){this.src=a,this.g={},this.h=0}$i.prototype.add=function(a,h,f,m,A){const S=a.toString();a=this.g[S],a||(a=this.g[S]=[],this.h++);const x=oc(a,h,m,A);return x>-1?(h=a[x],f||(h.fa=!1)):(h=new qE(h,this.src,S,!!m,A),h.fa=f,a.push(h)),h};function ic(a,h){const f=h.type;if(f in a.g){var m=a.g[f],A=Array.prototype.indexOf.call(m,h,void 0),S;(S=A>=0)&&Array.prototype.splice.call(m,A,1),S&&(Bi(h),a.g[f].length==0&&(delete a.g[f],a.h--))}}function oc(a,h,f,m){for(let A=0;A<a.length;++A){const S=a[A];if(!S.da&&S.listener==h&&S.capture==!!f&&S.ha==m)return A}return-1}var ac="closure_lm_"+(Math.random()*1e6|0),cc={};function Fh(a,h,f,m,A){if(Array.isArray(h)){for(let S=0;S<h.length;S++)Fh(a,h[S],f,m,A);return null}return f=qh(f),a&&a[Bn]?a.J(h,f,c(m)?!!m.capture:!1,A):jE(a,h,f,!1,m,A)}function jE(a,h,f,m,A,S){if(!h)throw Error("Invalid event type");const x=c(A)?!!A.capture:!!A;let z=uc(a);if(z||(a[ac]=z=new $i(a)),f=z.add(h,f,m,x,S),f.proxy)return f;if(m=WE(),f.proxy=m,m.src=a,m.listener=f,a.addEventListener)R||(A=x),A===void 0&&(A=!1),a.addEventListener(h.toString(),m,A);else if(a.attachEvent)a.attachEvent(Bh(h.toString()),m);else if(a.addListener&&a.removeListener)a.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return f}function WE(){function a(f){return h.call(a.src,a.listener,f)}const h=HE;return a}function Uh(a,h,f,m,A){if(Array.isArray(h))for(var S=0;S<h.length;S++)Uh(a,h[S],f,m,A);else m=c(m)?!!m.capture:!!m,f=qh(f),a&&a[Bn]?(a=a.i,S=String(h).toString(),S in a.g&&(h=a.g[S],f=oc(h,f,m,A),f>-1&&(Bi(h[f]),Array.prototype.splice.call(h,f,1),h.length==0&&(delete a.g[S],a.h--)))):a&&(a=uc(a))&&(h=a.g[h.toString()],a=-1,h&&(a=oc(h,f,m,A)),(f=a>-1?h[a]:null)&&lc(f))}function lc(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[Bn])ic(h.i,a);else{var f=a.type,m=a.proxy;h.removeEventListener?h.removeEventListener(f,m,a.capture):h.detachEvent?h.detachEvent(Bh(f),m):h.addListener&&h.removeListener&&h.removeListener(m),(f=uc(h))?(ic(f,a),f.h==0&&(f.src=null,h[ac]=null)):Bi(a)}}}function Bh(a){return a in cc?cc[a]:cc[a]="on"+a}function HE(a,h){if(a.da)a=!0;else{h=new Ze(h,this);const f=a.listener,m=a.ha||a.src;a.fa&&lc(a),a=f.call(m,h)}return a}function uc(a){return a=a[ac],a instanceof $i?a:null}var hc="__closure_events_fn_"+(Math.random()*1e9>>>0);function qh(a){return typeof a=="function"?a:(a[hc]||(a[hc]=function(h){return a.handleEvent(h)}),a[hc])}function Le(){I.call(this),this.i=new $i(this),this.M=this,this.G=null}p(Le,I),Le.prototype[Bn]=!0,Le.prototype.removeEventListener=function(a,h,f,m){Uh(this,a,h,f,m)};function je(a,h){var f,m=a.G;if(m)for(f=[];m;m=m.G)f.push(m);if(a=a.M,m=h.type||h,typeof h=="string")h=new v(h,a);else if(h instanceof v)h.target=h.target||a;else{var A=h;h=new v(m,a),Lh(h,A)}A=!0;let S,x;if(f)for(x=f.length-1;x>=0;x--)S=h.g=f[x],A=ji(S,m,!0,h)&&A;if(S=h.g=a,A=ji(S,m,!0,h)&&A,A=ji(S,m,!1,h)&&A,f)for(x=0;x<f.length;x++)S=h.g=f[x],A=ji(S,m,!1,h)&&A}Le.prototype.N=function(){if(Le.Z.N.call(this),this.i){var a=this.i;for(const h in a.g){const f=a.g[h];for(let m=0;m<f.length;m++)Bi(f[m]);delete a.g[h],a.h--}}this.G=null},Le.prototype.J=function(a,h,f,m){return this.i.add(String(a),h,!1,f,m)},Le.prototype.K=function(a,h,f,m){return this.i.add(String(a),h,!0,f,m)};function ji(a,h,f,m){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();let A=!0;for(let S=0;S<h.length;++S){const x=h[S];if(x&&!x.da&&x.capture==f){const z=x.listener,Ae=x.ha||x.src;x.fa&&ic(a.i,x),A=z.call(Ae,m)!==!1&&A}}return A&&!m.defaultPrevented}function zE(a,h){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=u(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(a,h||0)}function $h(a){a.g=zE(()=>{a.g=null,a.i&&(a.i=!1,$h(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class GE extends I{constructor(h,f){super(),this.m=h,this.l=f,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:$h(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function mr(a){I.call(this),this.h=a,this.g={}}p(mr,I);var jh=[];function Wh(a){qi(a.g,function(h,f){this.g.hasOwnProperty(f)&&lc(h)},a),a.g={}}mr.prototype.N=function(){mr.Z.N.call(this),Wh(this)},mr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var dc=o.JSON.stringify,KE=o.JSON.parse,QE=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Hh(){}function zh(){}var gr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function fc(){v.call(this,"d")}p(fc,v);function pc(){v.call(this,"c")}p(pc,v);var qn={},Gh=null;function Wi(){return Gh=Gh||new Le}qn.Ia="serverreachability";function Kh(a){v.call(this,qn.Ia,a)}p(Kh,v);function yr(a){const h=Wi();je(h,new Kh(h))}qn.STAT_EVENT="statevent";function Qh(a,h){v.call(this,qn.STAT_EVENT,a),this.stat=h}p(Qh,v);function We(a){const h=Wi();je(h,new Qh(h,a))}qn.Ja="timingevent";function Yh(a,h){v.call(this,qn.Ja,a),this.size=h}p(Yh,v);function Er(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},h)}function Tr(){this.g=!0}Tr.prototype.ua=function(){this.g=!1};function YE(a,h,f,m,A,S){a.info(function(){if(a.g)if(S){var x="",z=S.split("&");for(let re=0;re<z.length;re++){var Ae=z[re].split("=");if(Ae.length>1){const Pe=Ae[0];Ae=Ae[1];const Pt=Pe.split("_");x=Pt.length>=2&&Pt[1]=="type"?x+(Pe+"="+Ae+"&"):x+(Pe+"=redacted&")}}}else x=null;else x=S;return"XMLHTTP REQ ("+m+") [attempt "+A+"]: "+h+`
`+f+`
`+x})}function XE(a,h,f,m,A,S,x){a.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+A+"]: "+h+`
`+f+`
`+S+" "+x})}function _s(a,h,f,m){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+ZE(a,f)+(m?" "+m:"")})}function JE(a,h){a.info(function(){return"TIMEOUT: "+h})}Tr.prototype.info=function(){};function ZE(a,h){if(!a.g)return h;if(!h)return null;try{const S=JSON.parse(h);if(S){for(a=0;a<S.length;a++)if(Array.isArray(S[a])){var f=S[a];if(!(f.length<2)){var m=f[1];if(Array.isArray(m)&&!(m.length<1)){var A=m[0];if(A!="noop"&&A!="stop"&&A!="close")for(let x=1;x<m.length;x++)m[x]=""}}}}return dc(S)}catch{return h}}var Hi={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Xh={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Jh;function _c(){}p(_c,Hh),_c.prototype.g=function(){return new XMLHttpRequest},Jh=new _c;function vr(a){return encodeURIComponent(String(a))}function eT(a){var h=1;a=a.split(":");const f=[];for(;h>0&&a.length;)f.push(a.shift()),h--;return a.length&&f.push(a.join(":")),f}function Zt(a,h,f,m){this.j=a,this.i=h,this.l=f,this.S=m||1,this.V=new mr(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Zh}function Zh(){this.i=null,this.g="",this.h=!1}var ed={},mc={};function gc(a,h,f){a.M=1,a.A=Gi(bt(h)),a.u=f,a.R=!0,td(a,null)}function td(a,h){a.F=Date.now(),zi(a),a.B=bt(a.A);var f=a.B,m=a.S;Array.isArray(m)||(m=[String(m)]),pd(f.i,"t",m),a.C=0,f=a.j.L,a.h=new Zh,a.g=Dd(a.j,f?h:null,!a.u),a.P>0&&(a.O=new GE(u(a.Y,a,a.g),a.P)),h=a.V,f=a.g,m=a.ba;var A="readystatechange";Array.isArray(A)||(A&&(jh[0]=A.toString()),A=jh);for(let S=0;S<A.length;S++){const x=Fh(f,A[S],m||h.handleEvent,!1,h.h||h);if(!x)break;h.g[x.key]=x}h=a.J?Mh(a.J):{},a.u?(a.v||(a.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,h)):(a.v="GET",a.g.ea(a.B,a.v,null,h)),yr(),YE(a.i,a.v,a.B,a.l,a.S,a.u)}Zt.prototype.ba=function(a){a=a.target;const h=this.O;h&&nn(a)==3?h.j():this.Y(a)},Zt.prototype.Y=function(a){try{if(a==this.g)e:{const z=nn(this.g),Ae=this.g.ya(),re=this.g.ca();if(!(z<3)&&(z!=3||this.g&&(this.h.h||this.g.la()||vd(this.g)))){this.K||z!=4||Ae==7||(Ae==8||re<=0?yr(3):yr(2)),yc(this);var h=this.g.ca();this.X=h;var f=tT(this);if(this.o=h==200,XE(this.i,this.v,this.B,this.l,this.S,z,h),this.o){if(this.U&&!this.L){t:{if(this.g){var m,A=this.g;if((m=A.g?A.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(m)){var S=m;break t}}S=null}if(a=S)_s(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Ec(this,a);else{this.o=!1,this.m=3,We(12),$n(this),wr(this);break e}}if(this.R){a=!0;let Pe;for(;!this.K&&this.C<f.length;)if(Pe=nT(this,f),Pe==mc){z==4&&(this.m=4,We(14),a=!1),_s(this.i,this.l,null,"[Incomplete Response]");break}else if(Pe==ed){this.m=4,We(15),_s(this.i,this.l,f,"[Invalid Chunk]"),a=!1;break}else _s(this.i,this.l,Pe,null),Ec(this,Pe);if(nd(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),z!=4||f.length!=0||this.h.h||(this.m=1,We(16),a=!1),this.o=this.o&&a,!a)_s(this.i,this.l,f,"[Invalid Chunked Response]"),$n(this),wr(this);else if(f.length>0&&!this.W){this.W=!0;var x=this.j;x.g==this&&x.aa&&!x.P&&(x.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),Sc(x),x.P=!0,We(11))}}else _s(this.i,this.l,f,null),Ec(this,f);z==4&&$n(this),this.o&&!this.K&&(z==4?bd(this.j,this):(this.o=!1,zi(this)))}else mT(this.g),h==400&&f.indexOf("Unknown SID")>0?(this.m=3,We(12)):(this.m=0,We(13)),$n(this),wr(this)}}}catch{}finally{}};function tT(a){if(!nd(a))return a.g.la();const h=vd(a.g);if(h==="")return"";let f="";const m=h.length,A=nn(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return $n(a),wr(a),"";a.h.i=new o.TextDecoder}for(let S=0;S<m;S++)a.h.h=!0,f+=a.h.i.decode(h[S],{stream:!(A&&S==m-1)});return h.length=0,a.h.g+=f,a.C=0,a.h.g}function nd(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function nT(a,h){var f=a.C,m=h.indexOf(`
`,f);return m==-1?mc:(f=Number(h.substring(f,m)),isNaN(f)?ed:(m+=1,m+f>h.length?mc:(h=h.slice(m,m+f),a.C=m+f,h)))}Zt.prototype.cancel=function(){this.K=!0,$n(this)};function zi(a){a.T=Date.now()+a.H,sd(a,a.H)}function sd(a,h){if(a.D!=null)throw Error("WatchDog timer not null");a.D=Er(u(a.aa,a),h)}function yc(a){a.D&&(o.clearTimeout(a.D),a.D=null)}Zt.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(JE(this.i,this.B),this.M!=2&&(yr(),We(17)),$n(this),this.m=2,wr(this)):sd(this,this.T-a)};function wr(a){a.j.I==0||a.K||bd(a.j,a)}function $n(a){yc(a);var h=a.O;h&&typeof h.dispose=="function"&&h.dispose(),a.O=null,Wh(a.V),a.g&&(h=a.g,a.g=null,h.abort(),h.dispose())}function Ec(a,h){try{var f=a.j;if(f.I!=0&&(f.g==a||Tc(f.h,a))){if(!a.L&&Tc(f.h,a)&&f.I==3){try{var m=f.Ba.g.parse(h)}catch{m=null}if(Array.isArray(m)&&m.length==3){var A=m;if(A[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<a.F)Ji(f),Yi(f);else break e;Rc(f),We(18)}}else f.xa=A[1],0<f.xa-f.K&&A[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=Er(u(f.Va,f),6e3));od(f.h)<=1&&f.ta&&(f.ta=void 0)}else Wn(f,11)}else if((a.L||f.g==a)&&Ji(f),!y(h))for(A=f.Ba.g.parse(h),h=0;h<A.length;h++){let re=A[h];const Pe=re[0];if(!(Pe<=f.K))if(f.K=Pe,re=re[1],f.I==2)if(re[0]=="c"){f.M=re[1],f.ba=re[2];const Pt=re[3];Pt!=null&&(f.ka=Pt,f.j.info("VER="+f.ka));const Hn=re[4];Hn!=null&&(f.za=Hn,f.j.info("SVER="+f.za));const sn=re[5];sn!=null&&typeof sn=="number"&&sn>0&&(m=1.5*sn,f.O=m,f.j.info("backChannelRequestTimeoutMs_="+m)),m=f;const rn=a.g;if(rn){const eo=rn.g?rn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(eo){var S=m.h;S.g||eo.indexOf("spdy")==-1&&eo.indexOf("quic")==-1&&eo.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(vc(S,S.h),S.h=null))}if(m.G){const bc=rn.g?rn.g.getResponseHeader("X-HTTP-Session-Id"):null;bc&&(m.wa=bc,he(m.J,m.G,bc))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-a.F,f.j.info("Handshake RTT: "+f.T+"ms")),m=f;var x=a;if(m.na=Nd(m,m.L?m.ba:null,m.W),x.L){ad(m.h,x);var z=x,Ae=m.O;Ae&&(z.H=Ae),z.D&&(yc(z),zi(z)),m.g=x}else Rd(m);f.i.length>0&&Xi(f)}else re[0]!="stop"&&re[0]!="close"||Wn(f,7);else f.I==3&&(re[0]=="stop"||re[0]=="close"?re[0]=="stop"?Wn(f,7):Cc(f):re[0]!="noop"&&f.l&&f.l.qa(re),f.A=0)}}yr(4)}catch{}}var sT=class{constructor(a,h){this.g=a,this.map=h}};function rd(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function id(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function od(a){return a.h?1:a.g?a.g.size:0}function Tc(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function vc(a,h){a.g?a.g.add(h):a.h=h}function ad(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}rd.prototype.cancel=function(){if(this.i=cd(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function cd(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const f of a.g.values())h=h.concat(f.G);return h}return E(a.i)}var ld=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function rT(a,h){if(a){a=a.split("&");for(let f=0;f<a.length;f++){const m=a[f].indexOf("=");let A,S=null;m>=0?(A=a[f].substring(0,m),S=a[f].substring(m+1)):A=a[f],h(A,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function en(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;a instanceof en?(this.l=a.l,Ir(this,a.j),this.o=a.o,this.g=a.g,Ar(this,a.u),this.h=a.h,wc(this,_d(a.i)),this.m=a.m):a&&(h=String(a).match(ld))?(this.l=!1,Ir(this,h[1]||"",!0),this.o=Cr(h[2]||""),this.g=Cr(h[3]||"",!0),Ar(this,h[4]),this.h=Cr(h[5]||"",!0),wc(this,h[6]||"",!0),this.m=Cr(h[7]||"")):(this.l=!1,this.i=new Sr(null,this.l))}en.prototype.toString=function(){const a=[];var h=this.j;h&&a.push(Rr(h,ud,!0),":");var f=this.g;return(f||h=="file")&&(a.push("//"),(h=this.o)&&a.push(Rr(h,ud,!0),"@"),a.push(vr(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&a.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(Rr(f,f.charAt(0)=="/"?aT:oT,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",Rr(f,lT)),a.join("")},en.prototype.resolve=function(a){const h=bt(this);let f=!!a.j;f?Ir(h,a.j):f=!!a.o,f?h.o=a.o:f=!!a.g,f?h.g=a.g:f=a.u!=null;var m=a.h;if(f)Ar(h,a.u);else if(f=!!a.h){if(m.charAt(0)!="/")if(this.g&&!this.h)m="/"+m;else{var A=h.h.lastIndexOf("/");A!=-1&&(m=h.h.slice(0,A+1)+m)}if(A=m,A==".."||A==".")m="";else if(A.indexOf("./")!=-1||A.indexOf("/.")!=-1){m=A.lastIndexOf("/",0)==0,A=A.split("/");const S=[];for(let x=0;x<A.length;){const z=A[x++];z=="."?m&&x==A.length&&S.push(""):z==".."?((S.length>1||S.length==1&&S[0]!="")&&S.pop(),m&&x==A.length&&S.push("")):(S.push(z),m=!0)}m=S.join("/")}else m=A}return f?h.h=m:f=a.i.toString()!=="",f?wc(h,_d(a.i)):f=!!a.m,f&&(h.m=a.m),h};function bt(a){return new en(a)}function Ir(a,h,f){a.j=f?Cr(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function Ar(a,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);a.u=h}else a.u=null}function wc(a,h,f){h instanceof Sr?(a.i=h,uT(a.i,a.l)):(f||(h=Rr(h,cT)),a.i=new Sr(h,a.l))}function he(a,h,f){a.i.set(h,f)}function Gi(a){return he(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function Cr(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Rr(a,h,f){return typeof a=="string"?(a=encodeURI(a).replace(h,iT),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function iT(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var ud=/[#\/\?@]/g,oT=/[#\?:]/g,aT=/[#\?]/g,cT=/[#\?@]/g,lT=/#/g;function Sr(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function jn(a){a.g||(a.g=new Map,a.h=0,a.i&&rT(a.i,function(h,f){a.add(decodeURIComponent(h.replace(/\+/g," ")),f)}))}n=Sr.prototype,n.add=function(a,h){jn(this),this.i=null,a=ms(this,a);let f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(h),this.h+=1,this};function hd(a,h){jn(a),h=ms(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function dd(a,h){return jn(a),h=ms(a,h),a.g.has(h)}n.forEach=function(a,h){jn(this),this.g.forEach(function(f,m){f.forEach(function(A){a.call(h,A,m,this)},this)},this)};function fd(a,h){jn(a);let f=[];if(typeof h=="string")dd(a,h)&&(f=f.concat(a.g.get(ms(a,h))));else for(a=Array.from(a.g.values()),h=0;h<a.length;h++)f=f.concat(a[h]);return f}n.set=function(a,h){return jn(this),this.i=null,a=ms(this,a),dd(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},n.get=function(a,h){return a?(a=fd(this,a),a.length>0?String(a[0]):h):h};function pd(a,h,f){hd(a,h),f.length>0&&(a.i=null,a.g.set(ms(a,h),E(f)),a.h+=f.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(let m=0;m<h.length;m++){var f=h[m];const A=vr(f);f=fd(this,f);for(let S=0;S<f.length;S++){let x=A;f[S]!==""&&(x+="="+vr(f[S])),a.push(x)}}return this.i=a.join("&")};function _d(a){const h=new Sr;return h.i=a.i,a.g&&(h.g=new Map(a.g),h.h=a.h),h}function ms(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function uT(a,h){h&&!a.j&&(jn(a),a.i=null,a.g.forEach(function(f,m){const A=m.toLowerCase();m!=A&&(hd(this,m),pd(this,A,f))},a)),a.j=h}function hT(a,h){const f=new Tr;if(o.Image){const m=new Image;m.onload=d(tn,f,"TestLoadImage: loaded",!0,h,m),m.onerror=d(tn,f,"TestLoadImage: error",!1,h,m),m.onabort=d(tn,f,"TestLoadImage: abort",!1,h,m),m.ontimeout=d(tn,f,"TestLoadImage: timeout",!1,h,m),o.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=a}else h(!1)}function dT(a,h){const f=new Tr,m=new AbortController,A=setTimeout(()=>{m.abort(),tn(f,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:m.signal}).then(S=>{clearTimeout(A),S.ok?tn(f,"TestPingServer: ok",!0,h):tn(f,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(A),tn(f,"TestPingServer: error",!1,h)})}function tn(a,h,f,m,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),m(f)}catch{}}function fT(){this.g=new QE}function Ic(a){this.i=a.Sb||null,this.h=a.ab||!1}p(Ic,Hh),Ic.prototype.g=function(){return new Ki(this.i,this.h)};function Ki(a,h){Le.call(this),this.H=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(Ki,Le),n=Ki.prototype,n.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=h,this.readyState=1,Pr(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(h.body=a),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,br(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Pr(this)),this.g&&(this.readyState=3,Pr(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;md(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function md(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?br(this):Pr(this),this.readyState==3&&md(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,br(this))},n.Na=function(a){this.g&&(this.response=a,br(this))},n.ga=function(){this.g&&br(this)};function br(a){a.readyState=4,a.l=null,a.j=null,a.B=null,Pr(a)}n.setRequestHeader=function(a,h){this.A.append(a,h)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var f=h.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=h.next();return a.join(`\r
`)};function Pr(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Ki.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function gd(a){let h="";return qi(a,function(f,m){h+=m,h+=":",h+=f,h+=`\r
`}),h}function Ac(a,h,f){e:{for(m in f){var m=!1;break e}m=!0}m||(f=gd(f),typeof a=="string"?f!=null&&vr(f):he(a,h,f))}function ge(a){Le.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(ge,Le);var pT=/^https?$/i,_T=["POST","PUT"];n=ge.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,h,f,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Jh.g(),this.g.onreadystatechange=_(u(this.Ca,this));try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(S){yd(this,S);return}if(a=f||"",f=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var A in m)f.set(A,m[A]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const S of m.keys())f.set(S,m.get(S));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(f.keys()).find(S=>S.toLowerCase()=="content-type"),A=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(_T,h,void 0)>=0)||m||A||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,x]of f)this.g.setRequestHeader(S,x);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(S){yd(this,S)}};function yd(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.o=5,Ed(a),Qi(a)}function Ed(a){a.A||(a.A=!0,je(a,"complete"),je(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,je(this,"complete"),je(this,"abort"),Qi(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Qi(this,!0)),ge.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Td(this):this.Xa())},n.Xa=function(){Td(this)};function Td(a){if(a.h&&typeof i<"u"){if(a.v&&nn(a)==4)setTimeout(a.Ca.bind(a),0);else if(je(a,"readystatechange"),nn(a)==4){a.h=!1;try{const S=a.ca();e:switch(S){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var f;if(!(f=h)){var m;if(m=S===0){let x=String(a.D).match(ld)[1]||null;!x&&o.self&&o.self.location&&(x=o.self.location.protocol.slice(0,-1)),m=!pT.test(x?x.toLowerCase():"")}f=m}if(f)je(a,"complete"),je(a,"success");else{a.o=6;try{var A=nn(a)>2?a.g.statusText:""}catch{A=""}a.l=A+" ["+a.ca()+"]",Ed(a)}}finally{Qi(a)}}}}function Qi(a,h){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const f=a.g;a.g=null,h||je(a,"ready");try{f.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function nn(a){return a.g?a.g.readyState:0}n.ca=function(){try{return nn(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),KE(h)}};function vd(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function mT(a){const h={};a=(a.g&&nn(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<a.length;m++){if(y(a[m]))continue;var f=eT(a[m]);const A=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const S=h[A]||[];h[A]=S,S.push(f)}$E(h,function(m){return m.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function kr(a,h,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||h}function wd(a){this.za=0,this.i=[],this.j=new Tr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=kr("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=kr("baseRetryDelayMs",5e3,a),this.Za=kr("retryDelaySeedMs",1e4,a),this.Ta=kr("forwardChannelMaxRetries",2,a),this.va=kr("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new rd(a&&a.concurrentRequestLimit),this.Ba=new fT,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=wd.prototype,n.ka=8,n.I=1,n.connect=function(a,h,f,m){We(0),this.W=a,this.H=h||{},f&&m!==void 0&&(this.H.OSID=f,this.H.OAID=m),this.F=this.X,this.J=Nd(this,null,this.W),Xi(this)};function Cc(a){if(Id(a),a.I==3){var h=a.V++,f=bt(a.J);if(he(f,"SID",a.M),he(f,"RID",h),he(f,"TYPE","terminate"),Nr(a,f),h=new Zt(a,a.j,h),h.M=2,h.A=Gi(bt(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=h.A,f=!0),f||(h.g=Dd(h.j,null),h.g.ea(h.A)),h.F=Date.now(),zi(h)}kd(a)}function Yi(a){a.g&&(Sc(a),a.g.cancel(),a.g=null)}function Id(a){Yi(a),a.v&&(o.clearTimeout(a.v),a.v=null),Ji(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Xi(a){if(!id(a.h)&&!a.m){a.m=!0;var h=a.Ea;Ee||g(),ae||(Ee(),ae=!0),w.add(h,a),a.D=0}}function gT(a,h){return od(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=h.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=Er(u(a.Ea,a,h),Pd(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const A=new Zt(this,this.j,a);let S=this.o;if(this.U&&(S?(S=Mh(S),Lh(S,this.U)):S=this.U),this.u!==null||this.R||(A.J=S,S=null),this.S)e:{for(var h=0,f=0;f<this.i.length;f++){t:{var m=this.i[f];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(h+=m,h>4096){h=f;break e}if(h===4096||f===this.i.length-1){h=f+1;break e}}h=1e3}else h=1e3;h=Cd(this,A,h),f=bt(this.J),he(f,"RID",a),he(f,"CVER",22),this.G&&he(f,"X-HTTP-Session-Id",this.G),Nr(this,f),S&&(this.R?h="headers="+vr(gd(S))+"&"+h:this.u&&Ac(f,this.u,S)),vc(this.h,A),this.Ra&&he(f,"TYPE","init"),this.S?(he(f,"$req",h),he(f,"SID","null"),A.U=!0,gc(A,f,null)):gc(A,f,h),this.I=2}}else this.I==3&&(a?Ad(this,a):this.i.length==0||id(this.h)||Ad(this))};function Ad(a,h){var f;h?f=h.l:f=a.V++;const m=bt(a.J);he(m,"SID",a.M),he(m,"RID",f),he(m,"AID",a.K),Nr(a,m),a.u&&a.o&&Ac(m,a.u,a.o),f=new Zt(a,a.j,f,a.D+1),a.u===null&&(f.J=a.o),h&&(a.i=h.G.concat(a.i)),h=Cd(a,f,1e3),f.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),vc(a.h,f),gc(f,m,h)}function Nr(a,h){a.H&&qi(a.H,function(f,m){he(h,m,f)}),a.l&&qi({},function(f,m){he(h,m,f)})}function Cd(a,h,f){f=Math.min(a.i.length,f);const m=a.l?u(a.l.Ka,a.l,a):null;e:{var A=a.i;let z=-1;for(;;){const Ae=["count="+f];z==-1?f>0?(z=A[0].g,Ae.push("ofs="+z)):z=0:Ae.push("ofs="+z);let re=!0;for(let Pe=0;Pe<f;Pe++){var S=A[Pe].g;const Pt=A[Pe].map;if(S-=z,S<0)z=Math.max(0,A[Pe].g-100),re=!1;else try{S="req"+S+"_"||"";try{var x=Pt instanceof Map?Pt:Object.entries(Pt);for(const[Hn,sn]of x){let rn=sn;c(sn)&&(rn=dc(sn)),Ae.push(S+Hn+"="+encodeURIComponent(rn))}}catch(Hn){throw Ae.push(S+"type="+encodeURIComponent("_badmap")),Hn}}catch{m&&m(Pt)}}if(re){x=Ae.join("&");break e}}x=void 0}return a=a.i.splice(0,f),h.G=a,x}function Rd(a){if(!a.g&&!a.v){a.Y=1;var h=a.Da;Ee||g(),ae||(Ee(),ae=!0),w.add(h,a),a.A=0}}function Rc(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=Er(u(a.Da,a),Pd(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,Sd(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=Er(u(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,We(10),Yi(this),Sd(this))};function Sc(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function Sd(a){a.g=new Zt(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var h=bt(a.na);he(h,"RID","rpc"),he(h,"SID",a.M),he(h,"AID",a.K),he(h,"CI",a.F?"0":"1"),!a.F&&a.ia&&he(h,"TO",a.ia),he(h,"TYPE","xmlhttp"),Nr(a,h),a.u&&a.o&&Ac(h,a.u,a.o),a.O&&(a.g.H=a.O);var f=a.g;a=a.ba,f.M=1,f.A=Gi(bt(h)),f.u=null,f.R=!0,td(f,a)}n.Va=function(){this.C!=null&&(this.C=null,Yi(this),Rc(this),We(19))};function Ji(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function bd(a,h){var f=null;if(a.g==h){Ji(a),Sc(a),a.g=null;var m=2}else if(Tc(a.h,h))f=h.G,ad(a.h,h),m=1;else return;if(a.I!=0){if(h.o)if(m==1){f=h.u?h.u.length:0,h=Date.now()-h.F;var A=a.D;m=Wi(),je(m,new Yh(m,f)),Xi(a)}else Rd(a);else if(A=h.m,A==3||A==0&&h.X>0||!(m==1&&gT(a,h)||m==2&&Rc(a)))switch(f&&f.length>0&&(h=a.h,h.i=h.i.concat(f)),A){case 1:Wn(a,5);break;case 4:Wn(a,10);break;case 3:Wn(a,6);break;default:Wn(a,2)}}}function Pd(a,h){let f=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(f*=2),f*h}function Wn(a,h){if(a.j.info("Error code "+h),h==2){var f=u(a.bb,a),m=a.Ua;const A=!m;m=new en(m||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||Ir(m,"https"),Gi(m),A?hT(m.toString(),f):dT(m.toString(),f)}else We(2);a.I=0,a.l&&a.l.pa(h),kd(a),Id(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),We(2)):(this.j.info("Failed to ping google.com"),We(1))};function kd(a){if(a.I=0,a.ja=[],a.l){const h=cd(a.h);(h.length!=0||a.i.length!=0)&&(C(a.ja,h),C(a.ja,a.i),a.h.i.length=0,E(a.i),a.i.length=0),a.l.oa()}}function Nd(a,h,f){var m=f instanceof en?bt(f):new en(f);if(m.g!="")h&&(m.g=h+"."+m.g),Ar(m,m.u);else{var A=o.location;m=A.protocol,h=h?h+"."+A.hostname:A.hostname,A=+A.port;const S=new en(null);m&&Ir(S,m),h&&(S.g=h),A&&Ar(S,A),f&&(S.h=f),m=S}return f=a.G,h=a.wa,f&&h&&he(m,f,h),he(m,"VER",a.ka),Nr(a,m),m}function Dd(a,h,f){if(h&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Aa&&!a.ma?new ge(new Ic({ab:f})):new ge(a.ma),h.Fa(a.L),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Od(){}n=Od.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Zi(){}Zi.prototype.g=function(a,h){return new it(a,h)};function it(a,h){Le.call(this),this.g=new wd(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(a?a["X-WebChannel-Client-Profile"]=h.sa:a={"X-WebChannel-Client-Profile":h.sa}),this.g.U=a,(a=h&&h.Qb)&&!y(a)&&(this.g.u=a),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!y(h)&&(this.g.G=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new gs(this)}p(it,Le),it.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},it.prototype.close=function(){Cc(this.g)},it.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.v&&(f={},f.__data__=dc(a),a=f);h.i.push(new sT(h.Ya++,a)),h.I==3&&Xi(h)},it.prototype.N=function(){this.g.l=null,delete this.j,Cc(this.g),delete this.g,it.Z.N.call(this)};function xd(a){fc.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const f in h){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}p(xd,fc);function Md(){pc.call(this),this.status=1}p(Md,pc);function gs(a){this.g=a}p(gs,Od),gs.prototype.ra=function(){je(this.g,"a")},gs.prototype.qa=function(a){je(this.g,new xd(a))},gs.prototype.pa=function(a){je(this.g,new Md)},gs.prototype.oa=function(){je(this.g,"b")},Zi.prototype.createWebChannel=Zi.prototype.g,it.prototype.send=it.prototype.o,it.prototype.open=it.prototype.m,it.prototype.close=it.prototype.close,ym=function(){return new Zi},gm=function(){return Wi()},mm=qn,ul={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Hi.NO_ERROR=0,Hi.TIMEOUT=8,Hi.HTTP_ERROR=6,yo=Hi,Xh.COMPLETE="complete",_m=Xh,zh.EventType=gr,gr.OPEN="a",gr.CLOSE="b",gr.ERROR="c",gr.MESSAGE="d",Le.prototype.listen=Le.prototype.J,Lr=zh,ge.prototype.listenOnce=ge.prototype.K,ge.prototype.getLastError=ge.prototype.Ha,ge.prototype.getLastErrorCode=ge.prototype.ya,ge.prototype.getStatus=ge.prototype.ca,ge.prototype.getResponseJson=ge.prototype.La,ge.prototype.getResponseText=ge.prototype.la,ge.prototype.send=ge.prototype.ea,ge.prototype.setWithCredentials=ge.prototype.Fa,pm=ge}).apply(typeof ro<"u"?ro:typeof self<"u"?self:typeof window<"u"?window:{});const gf="@firebase/firestore",yf="4.9.2";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ue.UNAUTHENTICATED=new Ue(null),Ue.GOOGLE_CREDENTIALS=new Ue("google-credentials-uid"),Ue.FIRST_PARTY=new Ue("first-party-uid"),Ue.MOCK_USER=new Ue("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let sr="12.3.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const es=new yi("@firebase/firestore");function Ts(){return es.logLevel}function M(n,...e){if(es.logLevel<=X.DEBUG){const t=e.map(au);es.debug(`Firestore (${sr}): ${n}`,...t)}}function Qt(n,...e){if(es.logLevel<=X.ERROR){const t=e.map(au);es.error(`Firestore (${sr}): ${n}`,...t)}}function ts(n,...e){if(es.logLevel<=X.WARN){const t=e.map(au);es.warn(`Firestore (${sr}): ${n}`,...t)}}function au(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q(n,e,t){let s="Unexpected state";typeof e=="string"?s=e:t=e,Em(n,s,t)}function Em(n,e,t){let s=`FIRESTORE (${sr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{s+=" CONTEXT: "+JSON.stringify(t)}catch{s+=" CONTEXT: "+t}throw Qt(s),new Error(s)}function ne(n,e,t,s){let r="Unexpected state";typeof t=="string"?r=t:s=t,n||Em(e,r,s)}function W(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends At{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tm{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class vm{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ue.UNAUTHENTICATED))}shutdown(){}}class HA{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class zA{constructor(e){this.t=e,this.currentUser=Ue.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){ne(this.o===void 0,42304);let s=this.i;const r=l=>this.i!==s?(s=this.i,t(l)):Promise.resolve();let i=new Ot;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Ot,e.enqueueRetryable(()=>r(this.currentUser))};const o=()=>{const l=i;e.enqueueRetryable(async()=>{await l.promise,await r(this.currentUser)})},c=l=>{M("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(l=>c(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?c(l):(M("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Ot)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(s=>this.i!==e?(M("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(ne(typeof s.accessToken=="string",31837,{l:s}),new Tm(s.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ne(e===null||typeof e=="string",2055,{h:e}),new Ue(e)}}class GA{constructor(e,t,s){this.P=e,this.T=t,this.I=s,this.type="FirstParty",this.user=Ue.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class KA{constructor(e,t,s){this.P=e,this.T=t,this.I=s}getToken(){return Promise.resolve(new GA(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(Ue.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Ef{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class QA{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Ke(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){ne(this.o===void 0,3512);const s=i=>{i.error!=null&&M("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,M("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>s(i))};const r=i=>{M("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>r(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?r(i):M("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Ef(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(ne(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Ef(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function YA(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let s=0;s<n;s++)t[s]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ea{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let s="";for(;s.length<20;){const r=YA(40);for(let i=0;i<r.length;++i)s.length<20&&r[i]<t&&(s+=e.charAt(r[i]%62))}return s}}function J(n,e){return n<e?-1:n>e?1:0}function hl(n,e){const t=Math.min(n.length,e.length);for(let s=0;s<t;s++){const r=n.charAt(s),i=e.charAt(s);if(r!==i)return Fc(r)===Fc(i)?J(r,i):Fc(r)?1:-1}return J(n.length,e.length)}const XA=55296,JA=57343;function Fc(n){const e=n.charCodeAt(0);return e>=XA&&e<=JA}function Vs(n,e,t){return n.length===e.length&&n.every((s,r)=>t(s,e[r]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tf="__name__";class kt{constructor(e,t,s){t===void 0?t=0:t>e.length&&q(637,{offset:t,range:e.length}),s===void 0?s=e.length-t:s>e.length-t&&q(1746,{length:s,range:e.length-t}),this.segments=e,this.offset=t,this.len=s}get length(){return this.len}isEqual(e){return kt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof kt?e.forEach(s=>{t.push(s)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,s=this.limit();t<s;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const s=Math.min(e.length,t.length);for(let r=0;r<s;r++){const i=kt.compareSegments(e.get(r),t.get(r));if(i!==0)return i}return J(e.length,t.length)}static compareSegments(e,t){const s=kt.isNumericId(e),r=kt.isNumericId(t);return s&&!r?-1:!s&&r?1:s&&r?kt.extractNumericId(e).compare(kt.extractNumericId(t)):hl(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return En.fromString(e.substring(4,e.length-2))}}class oe extends kt{construct(e,t,s){return new oe(e,t,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const s of e){if(s.indexOf("//")>=0)throw new O(P.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);t.push(...s.split("/").filter(r=>r.length>0))}return new oe(t)}static emptyPath(){return new oe([])}}const ZA=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class xe extends kt{construct(e,t,s){return new xe(e,t,s)}static isValidIdentifier(e){return ZA.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),xe.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Tf}static keyField(){return new xe([Tf])}static fromServerFormat(e){const t=[];let s="",r=0;const i=()=>{if(s.length===0)throw new O(P.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(s),s=""};let o=!1;for(;r<e.length;){const c=e[r];if(c==="\\"){if(r+1===e.length)throw new O(P.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new O(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);s+=l,r+=2}else c==="`"?(o=!o,r++):c!=="."||o?(s+=c,r++):(i(),r++)}if(i(),o)throw new O(P.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new xe(t)}static emptyPath(){return new xe([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L{constructor(e){this.path=e}static fromPath(e){return new L(oe.fromString(e))}static fromName(e){return new L(oe.fromString(e).popFirst(5))}static empty(){return new L(oe.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&oe.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return oe.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new L(new oe(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wm(n,e,t){if(!t)throw new O(P.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Im(n,e,t,s){if(e===!0&&s===!0)throw new O(P.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function vf(n){if(!L.isDocumentKey(n))throw new O(P.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function wf(n){if(L.isDocumentKey(n))throw new O(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Am(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Ta(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(s){return s.constructor?s.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":q(12329,{type:typeof n})}function Se(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new O(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Ta(n);throw new O(P.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function eC(n,e){if(e<=0)throw new O(P.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function we(n,e){const t={typeString:n};return e&&(t.value=e),t}function wi(n,e){if(!Am(n))throw new O(P.INVALID_ARGUMENT,"JSON must be an object");let t;for(const s in e)if(e[s]){const r=e[s].typeString,i="value"in e[s]?{value:e[s].value}:void 0;if(!(s in n)){t=`JSON missing required field: '${s}'`;break}const o=n[s];if(r&&typeof o!==r){t=`JSON field '${s}' must be a ${r}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${s}' field to equal '${i.value}'`;break}}if(t)throw new O(P.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const If=-62135596800,Af=1e6;class le{static now(){return le.fromMillis(Date.now())}static fromDate(e){return le.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),s=Math.floor((e-1e3*t)*Af);return new le(t,s)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new O(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new O(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<If)throw new O(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new O(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Af}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:le._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(wi(e,le._jsonSchema))return new le(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-If;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}le._jsonSchemaVersion="firestore/timestamp/1.0",le._jsonSchema={type:we("string",le._jsonSchemaVersion),seconds:we("number"),nanoseconds:we("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{static fromTimestamp(e){return new H(e)}static min(){return new H(new le(0,0))}static max(){return new H(new le(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ni=-1;function tC(n,e){const t=n.toTimestamp().seconds,s=n.toTimestamp().nanoseconds+1,r=H.fromTimestamp(s===1e9?new le(t+1,0):new le(t,s));return new Cn(r,L.empty(),e)}function nC(n){return new Cn(n.readTime,n.key,ni)}class Cn{constructor(e,t,s){this.readTime=e,this.documentKey=t,this.largestBatchId=s}static min(){return new Cn(H.min(),L.empty(),ni)}static max(){return new Cn(H.max(),L.empty(),ni)}}function sC(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=L.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rC="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class iC{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rr(n){if(n.code!==P.FAILED_PRECONDITION||n.message!==rC)throw n;M("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&q(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new N((s,r)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(s,r)},this.catchCallback=i=>{this.wrapFailure(t,i).next(s,r)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof N?t:N.resolve(t)}catch(t){return N.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):N.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):N.reject(t)}static resolve(e){return new N((t,s)=>{t(e)})}static reject(e){return new N((t,s)=>{s(e)})}static waitFor(e){return new N((t,s)=>{let r=0,i=0,o=!1;e.forEach(c=>{++r,c.next(()=>{++i,o&&i===r&&t()},l=>s(l))}),o=!0,i===r&&t()})}static or(e){let t=N.resolve(!1);for(const s of e)t=t.next(r=>r?N.resolve(r):s());return t}static forEach(e,t){const s=[];return e.forEach((r,i)=>{s.push(t.call(this,r,i))}),this.waitFor(s)}static mapArray(e,t){return new N((s,r)=>{const i=e.length,o=new Array(i);let c=0;for(let l=0;l<i;l++){const u=l;t(e[u]).next(d=>{o[u]=d,++c,c===i&&s(o)},d=>r(d))}})}static doWhile(e,t){return new N((s,r)=>{const i=()=>{e()===!0?t().next(()=>{i()},r):s()};i()})}}function oC(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function ir(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class va{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=s=>this.ae(s),this.ue=s=>t.writeSequenceNumber(s))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}va.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cu=-1;function wa(n){return n==null}function Mo(n){return n===0&&1/n==-1/0}function aC(n){return typeof n=="number"&&Number.isInteger(n)&&!Mo(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cm="";function cC(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Cf(e)),e=lC(n.get(t),e);return Cf(e)}function lC(n,e){let t=e;const s=n.length;for(let r=0;r<s;r++){const i=n.charAt(r);switch(i){case"\0":t+="";break;case Cm:t+="";break;default:t+=i}}return t}function Cf(n){return n+Cm+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rf(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Ln(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function uC(n,e){const t=[];for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&t.push(e(n[s],s,n));return t}function Rm(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ie=class dl{constructor(e,t){this.comparator=e,this.root=t||Tn.EMPTY}insert(e,t){return new dl(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Tn.BLACK,null,null))}remove(e){return new dl(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Tn.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const s=this.comparator(e,t.key);if(s===0)return t.value;s<0?t=t.left:s>0&&(t=t.right)}return null}indexOf(e){let t=0,s=this.root;for(;!s.isEmpty();){const r=this.comparator(e,s.key);if(r===0)return t+s.left.size;r<0?s=s.left:(t+=s.left.size+1,s=s.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,s)=>(e(t,s),!1))}toString(){const e=[];return this.inorderTraversal((t,s)=>(e.push(`${t}:${s}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new io(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new io(this.root,e,this.comparator,!1)}getReverseIterator(){return new io(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new io(this.root,e,this.comparator,!0)}},io=class{constructor(e,t,s,r){this.isReverse=r,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?s(e.key,t):1,t&&r&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},Tn=class Bt{constructor(e,t,s,r,i){this.key=e,this.value=t,this.color=s??Bt.RED,this.left=r??Bt.EMPTY,this.right=i??Bt.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,s,r,i){return new Bt(e??this.key,t??this.value,s??this.color,r??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let r=this;const i=s(e,r.key);return r=i<0?r.copy(null,null,null,r.left.insert(e,t,s),null):i===0?r.copy(null,t,null,null,null):r.copy(null,null,null,null,r.right.insert(e,t,s)),r.fixUp()}removeMin(){if(this.left.isEmpty())return Bt.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let s,r=this;if(t(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),t(e,r.key)===0){if(r.right.isEmpty())return Bt.EMPTY;s=r.right.min(),r=r.copy(s.key,s.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Bt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Bt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw q(43730,{key:this.key,value:this.value});if(this.right.isRed())throw q(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw q(27949);return e+(this.isRed()?0:1)}};Tn.EMPTY=null,Tn.RED=!0,Tn.BLACK=!1;Tn.EMPTY=new class{constructor(){this.size=0}get key(){throw q(57766)}get value(){throw q(16141)}get color(){throw q(16727)}get left(){throw q(29726)}get right(){throw q(36894)}copy(e,t,s,r,i){return this}insert(e,t,s){return new Tn(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(e){this.comparator=e,this.data=new Ie(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,s)=>(e(t),!1))}forEachInRange(e,t){const s=this.data.getIteratorFrom(e[0]);for(;s.hasNext();){const r=s.getNext();if(this.comparator(r.key,e[1])>=0)return;t(r.key)}}forEachWhile(e,t){let s;for(s=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();s.hasNext();)if(!e(s.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Sf(this.data.getIterator())}getIteratorFrom(e){return new Sf(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(s=>{t=t.add(s)}),t}isEqual(e){if(!(e instanceof be)||this.size!==e.size)return!1;const t=this.data.getIterator(),s=e.data.getIterator();for(;t.hasNext();){const r=t.getNext().key,i=s.getNext().key;if(this.comparator(r,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new be(this.comparator);return t.data=e,t}}class Sf{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e){this.fields=e,e.sort(xe.comparator)}static empty(){return new at([])}unionWith(e){let t=new be(xe.comparator);for(const s of this.fields)t=t.add(s);for(const s of e)t=t.add(s);return new at(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Vs(this.fields,e.fields,(t,s)=>t.isEqual(s))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sm extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Me{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(r){try{return atob(r)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Sm("Invalid base64 string: "+i):i}}(e);return new Me(t)}static fromUint8Array(e){const t=function(r){let i="";for(let o=0;o<r.length;++o)i+=String.fromCharCode(r[o]);return i}(e);return new Me(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const s=new Uint8Array(t.length);for(let r=0;r<t.length;r++)s[r]=t.charCodeAt(r);return s}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Me.EMPTY_BYTE_STRING=new Me("");const hC=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Rn(n){if(ne(!!n,39018),typeof n=="string"){let e=0;const t=hC.exec(n);if(ne(!!t,46558,{timestamp:n}),t[1]){let r=t[1];r=(r+"000000000").substr(0,9),e=Number(r)}const s=new Date(n);return{seconds:Math.floor(s.getTime()/1e3),nanos:e}}return{seconds:ye(n.seconds),nanos:ye(n.nanos)}}function ye(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Sn(n){return typeof n=="string"?Me.fromBase64String(n):Me.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bm="server_timestamp",Pm="__type__",km="__previous_value__",Nm="__local_write_time__";function Ia(n){var t,s;return((s=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Pm])==null?void 0:s.stringValue)===bm}function Aa(n){const e=n.mapValue.fields[km];return Ia(e)?Aa(e):e}function si(n){const e=Rn(n.mapValue.fields[Nm].timestampValue);return new le(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dC{constructor(e,t,s,r,i,o,c,l,u,d){this.databaseId=e,this.appId=t,this.persistenceKey=s,this.host=r,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=u,this.isUsingEmulator=d}}const Vo="(default)";class Ls{constructor(e,t){this.projectId=e,this.database=t||Vo}static empty(){return new Ls("","")}get isDefaultDatabase(){return this.database===Vo}isEqual(e){return e instanceof Ls&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dm="__type__",fC="__max__",oo={mapValue:{}},Om="__vector__",Lo="value";function bn(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ia(n)?4:_C(n)?9007199254740991:pC(n)?10:11:q(28295,{value:n})}function Ft(n,e){if(n===e)return!0;const t=bn(n);if(t!==bn(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return si(n).isEqual(si(e));case 3:return function(r,i){if(typeof r.timestampValue=="string"&&typeof i.timestampValue=="string"&&r.timestampValue.length===i.timestampValue.length)return r.timestampValue===i.timestampValue;const o=Rn(r.timestampValue),c=Rn(i.timestampValue);return o.seconds===c.seconds&&o.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(r,i){return Sn(r.bytesValue).isEqual(Sn(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(r,i){return ye(r.geoPointValue.latitude)===ye(i.geoPointValue.latitude)&&ye(r.geoPointValue.longitude)===ye(i.geoPointValue.longitude)}(n,e);case 2:return function(r,i){if("integerValue"in r&&"integerValue"in i)return ye(r.integerValue)===ye(i.integerValue);if("doubleValue"in r&&"doubleValue"in i){const o=ye(r.doubleValue),c=ye(i.doubleValue);return o===c?Mo(o)===Mo(c):isNaN(o)&&isNaN(c)}return!1}(n,e);case 9:return Vs(n.arrayValue.values||[],e.arrayValue.values||[],Ft);case 10:case 11:return function(r,i){const o=r.mapValue.fields||{},c=i.mapValue.fields||{};if(Rf(o)!==Rf(c))return!1;for(const l in o)if(o.hasOwnProperty(l)&&(c[l]===void 0||!Ft(o[l],c[l])))return!1;return!0}(n,e);default:return q(52216,{left:n})}}function ri(n,e){return(n.values||[]).find(t=>Ft(t,e))!==void 0}function Fs(n,e){if(n===e)return 0;const t=bn(n),s=bn(e);if(t!==s)return J(t,s);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return function(i,o){const c=ye(i.integerValue||i.doubleValue),l=ye(o.integerValue||o.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1}(n,e);case 3:return bf(n.timestampValue,e.timestampValue);case 4:return bf(si(n),si(e));case 5:return hl(n.stringValue,e.stringValue);case 6:return function(i,o){const c=Sn(i),l=Sn(o);return c.compareTo(l)}(n.bytesValue,e.bytesValue);case 7:return function(i,o){const c=i.split("/"),l=o.split("/");for(let u=0;u<c.length&&u<l.length;u++){const d=J(c[u],l[u]);if(d!==0)return d}return J(c.length,l.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,o){const c=J(ye(i.latitude),ye(o.latitude));return c!==0?c:J(ye(i.longitude),ye(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Pf(n.arrayValue,e.arrayValue);case 10:return function(i,o){var _,E,C,k;const c=i.fields||{},l=o.fields||{},u=(_=c[Lo])==null?void 0:_.arrayValue,d=(E=l[Lo])==null?void 0:E.arrayValue,p=J(((C=u==null?void 0:u.values)==null?void 0:C.length)||0,((k=d==null?void 0:d.values)==null?void 0:k.length)||0);return p!==0?p:Pf(u,d)}(n.mapValue,e.mapValue);case 11:return function(i,o){if(i===oo.mapValue&&o===oo.mapValue)return 0;if(i===oo.mapValue)return 1;if(o===oo.mapValue)return-1;const c=i.fields||{},l=Object.keys(c),u=o.fields||{},d=Object.keys(u);l.sort(),d.sort();for(let p=0;p<l.length&&p<d.length;++p){const _=hl(l[p],d[p]);if(_!==0)return _;const E=Fs(c[l[p]],u[d[p]]);if(E!==0)return E}return J(l.length,d.length)}(n.mapValue,e.mapValue);default:throw q(23264,{he:t})}}function bf(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=Rn(n),s=Rn(e),r=J(t.seconds,s.seconds);return r!==0?r:J(t.nanos,s.nanos)}function Pf(n,e){const t=n.values||[],s=e.values||[];for(let r=0;r<t.length&&r<s.length;++r){const i=Fs(t[r],s[r]);if(i)return i}return J(t.length,s.length)}function Us(n){return fl(n)}function fl(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const s=Rn(t);return`time(${s.seconds},${s.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Sn(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return L.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let s="[",r=!0;for(const i of t.values||[])r?r=!1:s+=",",s+=fl(i);return s+"]"}(n.arrayValue):"mapValue"in n?function(t){const s=Object.keys(t.fields||{}).sort();let r="{",i=!0;for(const o of s)i?i=!1:r+=",",r+=`${o}:${fl(t.fields[o])}`;return r+"}"}(n.mapValue):q(61005,{value:n})}function Eo(n){switch(bn(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Aa(n);return e?16+Eo(e):16;case 5:return 2*n.stringValue.length;case 6:return Sn(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(s){return(s.values||[]).reduce((r,i)=>r+Eo(i),0)}(n.arrayValue);case 10:case 11:return function(s){let r=0;return Ln(s.fields,(i,o)=>{r+=i.length+Eo(o)}),r}(n.mapValue);default:throw q(13486,{value:n})}}function Fo(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function pl(n){return!!n&&"integerValue"in n}function lu(n){return!!n&&"arrayValue"in n}function kf(n){return!!n&&"nullValue"in n}function Nf(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function To(n){return!!n&&"mapValue"in n}function pC(n){var t,s;return((s=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Dm])==null?void 0:s.stringValue)===Om}function $r(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return Ln(n.mapValue.fields,(t,s)=>e.mapValue.fields[t]=$r(s)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=$r(n.arrayValue.values[t]);return e}return{...n}}function _C(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===fC}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(e){this.value=e}static empty(){return new tt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let s=0;s<e.length-1;++s)if(t=(t.mapValue.fields||{})[e.get(s)],!To(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=$r(t)}setAll(e){let t=xe.emptyPath(),s={},r=[];e.forEach((o,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,s,r),s={},r=[],t=c.popLast()}o?s[c.lastSegment()]=$r(o):r.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,s,r)}delete(e){const t=this.field(e.popLast());To(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Ft(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let s=0;s<e.length;++s){let r=t.mapValue.fields[e.get(s)];To(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},t.mapValue.fields[e.get(s)]=r),t=r}return t.mapValue.fields}applyChanges(e,t,s){Ln(t,(r,i)=>e[r]=i);for(const r of s)delete e[r]}clone(){return new tt($r(this.value))}}function xm(n){const e=[];return Ln(n.fields,(t,s)=>{const r=new xe([t]);if(To(s)){const i=xm(s.mapValue).fields;if(i.length===0)e.push(r);else for(const o of i)e.push(r.child(o))}else e.push(r)}),new at(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(e,t,s,r,i,o,c){this.key=e,this.documentType=t,this.version=s,this.readTime=r,this.createTime=i,this.data=o,this.documentState=c}static newInvalidDocument(e){return new Be(e,0,H.min(),H.min(),H.min(),tt.empty(),0)}static newFoundDocument(e,t,s,r){return new Be(e,1,t,H.min(),s,r,0)}static newNoDocument(e,t){return new Be(e,2,t,H.min(),H.min(),tt.empty(),0)}static newUnknownDocument(e,t){return new Be(e,3,t,H.min(),H.min(),tt.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(H.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=tt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=tt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=H.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Be&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Be(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bs{constructor(e,t){this.position=e,this.inclusive=t}}function Df(n,e,t){let s=0;for(let r=0;r<n.position.length;r++){const i=e[r],o=n.position[r];if(i.field.isKeyField()?s=L.comparator(L.fromName(o.referenceValue),t.key):s=Fs(o,t.data.field(i.field)),i.dir==="desc"&&(s*=-1),s!==0)break}return s}function Of(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Ft(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ii{constructor(e,t="asc"){this.field=e,this.dir=t}}function mC(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mm{}class ve extends Mm{constructor(e,t,s){super(),this.field=e,this.op=t,this.value=s}static create(e,t,s){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,s):new yC(e,t,s):t==="array-contains"?new vC(e,s):t==="in"?new wC(e,s):t==="not-in"?new IC(e,s):t==="array-contains-any"?new AC(e,s):new ve(e,t,s)}static createKeyFieldInFilter(e,t,s){return t==="in"?new EC(e,s):new TC(e,s)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Fs(t,this.value)):t!==null&&bn(this.value)===bn(t)&&this.matchesComparison(Fs(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return q(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class It extends Mm{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new It(e,t)}matches(e){return Vm(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Vm(n){return n.op==="and"}function Lm(n){return gC(n)&&Vm(n)}function gC(n){for(const e of n.filters)if(e instanceof It)return!1;return!0}function _l(n){if(n instanceof ve)return n.field.canonicalString()+n.op.toString()+Us(n.value);if(Lm(n))return n.filters.map(e=>_l(e)).join(",");{const e=n.filters.map(t=>_l(t)).join(",");return`${n.op}(${e})`}}function Fm(n,e){return n instanceof ve?function(s,r){return r instanceof ve&&s.op===r.op&&s.field.isEqual(r.field)&&Ft(s.value,r.value)}(n,e):n instanceof It?function(s,r){return r instanceof It&&s.op===r.op&&s.filters.length===r.filters.length?s.filters.reduce((i,o,c)=>i&&Fm(o,r.filters[c]),!0):!1}(n,e):void q(19439)}function Um(n){return n instanceof ve?function(t){return`${t.field.canonicalString()} ${t.op} ${Us(t.value)}`}(n):n instanceof It?function(t){return t.op.toString()+" {"+t.getFilters().map(Um).join(" ,")+"}"}(n):"Filter"}class yC extends ve{constructor(e,t,s){super(e,t,s),this.key=L.fromName(s.referenceValue)}matches(e){const t=L.comparator(e.key,this.key);return this.matchesComparison(t)}}class EC extends ve{constructor(e,t){super(e,"in",t),this.keys=Bm("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class TC extends ve{constructor(e,t){super(e,"not-in",t),this.keys=Bm("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Bm(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(s=>L.fromName(s.referenceValue))}class vC extends ve{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return lu(t)&&ri(t.arrayValue,this.value)}}class wC extends ve{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&ri(this.value.arrayValue,t)}}class IC extends ve{constructor(e,t){super(e,"not-in",t)}matches(e){if(ri(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!ri(this.value.arrayValue,t)}}class AC extends ve{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!lu(t)||!t.arrayValue.values)&&t.arrayValue.values.some(s=>ri(this.value.arrayValue,s))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CC{constructor(e,t=null,s=[],r=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=s,this.filters=r,this.limit=i,this.startAt=o,this.endAt=c,this.Te=null}}function xf(n,e=null,t=[],s=[],r=null,i=null,o=null){return new CC(n,e,t,s,r,i,o)}function uu(n){const e=W(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(s=>_l(s)).join(","),t+="|ob:",t+=e.orderBy.map(s=>function(i){return i.field.canonicalString()+i.dir}(s)).join(","),wa(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(s=>Us(s)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(s=>Us(s)).join(",")),e.Te=t}return e.Te}function hu(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!mC(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Fm(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Of(n.startAt,e.startAt)&&Of(n.endAt,e.endAt)}function ml(n){return L.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cs{constructor(e,t=null,s=[],r=[],i=null,o="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=s,this.filters=r,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=l,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function RC(n,e,t,s,r,i,o,c){return new cs(n,e,t,s,r,i,o,c)}function Ca(n){return new cs(n)}function Mf(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function du(n){return n.collectionGroup!==null}function ks(n){const e=W(n);if(e.Ie===null){e.Ie=[];const t=new Set;for(const i of e.explicitOrderBy)e.Ie.push(i),t.add(i.field.canonicalString());const s=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new be(xe.comparator);return o.filters.forEach(l=>{l.getFlattenedFilters().forEach(u=>{u.isInequality()&&(c=c.add(u.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.Ie.push(new ii(i,s))}),t.has(xe.keyField().canonicalString())||e.Ie.push(new ii(xe.keyField(),s))}return e.Ie}function xt(n){const e=W(n);return e.Ee||(e.Ee=qm(e,ks(n))),e.Ee}function SC(n){const e=W(n);return e.de||(e.de=qm(e,n.explicitOrderBy)),e.de}function qm(n,e){if(n.limitType==="F")return xf(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(r=>{const i=r.dir==="desc"?"asc":"desc";return new ii(r.field,i)});const t=n.endAt?new Bs(n.endAt.position,n.endAt.inclusive):null,s=n.startAt?new Bs(n.startAt.position,n.startAt.inclusive):null;return xf(n.path,n.collectionGroup,e,n.filters,n.limit,t,s)}}function gl(n,e){const t=n.filters.concat([e]);return new cs(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Uo(n,e,t){return new cs(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Ra(n,e){return hu(xt(n),xt(e))&&n.limitType===e.limitType}function $m(n){return`${uu(xt(n))}|lt:${n.limitType}`}function vs(n){return`Query(target=${function(t){let s=t.path.canonicalString();return t.collectionGroup!==null&&(s+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(s+=`, filters: [${t.filters.map(r=>Um(r)).join(", ")}]`),wa(t.limit)||(s+=", limit: "+t.limit),t.orderBy.length>0&&(s+=`, orderBy: [${t.orderBy.map(r=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(r)).join(", ")}]`),t.startAt&&(s+=", startAt: ",s+=t.startAt.inclusive?"b:":"a:",s+=t.startAt.position.map(r=>Us(r)).join(",")),t.endAt&&(s+=", endAt: ",s+=t.endAt.inclusive?"a:":"b:",s+=t.endAt.position.map(r=>Us(r)).join(",")),`Target(${s})`}(xt(n))}; limitType=${n.limitType})`}function Sa(n,e){return e.isFoundDocument()&&function(s,r){const i=r.key.path;return s.collectionGroup!==null?r.key.hasCollectionId(s.collectionGroup)&&s.path.isPrefixOf(i):L.isDocumentKey(s.path)?s.path.isEqual(i):s.path.isImmediateParentOf(i)}(n,e)&&function(s,r){for(const i of ks(s))if(!i.field.isKeyField()&&r.data.field(i.field)===null)return!1;return!0}(n,e)&&function(s,r){for(const i of s.filters)if(!i.matches(r))return!1;return!0}(n,e)&&function(s,r){return!(s.startAt&&!function(o,c,l){const u=Df(o,c,l);return o.inclusive?u<=0:u<0}(s.startAt,ks(s),r)||s.endAt&&!function(o,c,l){const u=Df(o,c,l);return o.inclusive?u>=0:u>0}(s.endAt,ks(s),r))}(n,e)}function bC(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function jm(n){return(e,t)=>{let s=!1;for(const r of ks(n)){const i=PC(r,e,t);if(i!==0)return i;s=s||r.field.isKeyField()}return 0}}function PC(n,e,t){const s=n.field.isKeyField()?L.comparator(e.key,t.key):function(i,o,c){const l=o.data.field(i),u=c.data.field(i);return l!==null&&u!==null?Fs(l,u):q(42886)}(n.field,e,t);switch(n.dir){case"asc":return s;case"desc":return-1*s;default:return q(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),s=this.inner[t];if(s!==void 0){for(const[r,i]of s)if(this.equalsFn(r,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const s=this.mapKeyFn(e),r=this.inner[s];if(r===void 0)return this.inner[s]=[[e,t]],void this.innerSize++;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return void(r[i]=[e,t]);r.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),s=this.inner[t];if(s===void 0)return!1;for(let r=0;r<s.length;r++)if(this.equalsFn(s[r][0],e))return s.length===1?delete this.inner[t]:s.splice(r,1),this.innerSize--,!0;return!1}forEach(e){Ln(this.inner,(t,s)=>{for(const[r,i]of s)e(r,i)})}isEmpty(){return Rm(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kC=new Ie(L.comparator);function Yt(){return kC}const Wm=new Ie(L.comparator);function Fr(...n){let e=Wm;for(const t of n)e=e.insert(t.key,t);return e}function Hm(n){let e=Wm;return n.forEach((t,s)=>e=e.insert(t,s.overlayedDocument)),e}function Qn(){return jr()}function zm(){return jr()}function jr(){return new ls(n=>n.toString(),(n,e)=>n.isEqual(e))}const NC=new Ie(L.comparator),DC=new be(L.comparator);function Z(...n){let e=DC;for(const t of n)e=e.add(t);return e}const OC=new be(J);function xC(){return OC}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fu(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Mo(e)?"-0":e}}function Gm(n){return{integerValue:""+n}}function Km(n,e){return aC(e)?Gm(e):fu(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ba{constructor(){this._=void 0}}function MC(n,e,t){return n instanceof oi?function(r,i){const o={fields:{[Pm]:{stringValue:bm},[Nm]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return i&&Ia(i)&&(i=Aa(i)),i&&(o.fields[km]=i),{mapValue:o}}(t,e):n instanceof qs?Ym(n,e):n instanceof ai?Xm(n,e):function(r,i){const o=Qm(r,i),c=Vf(o)+Vf(r.Ae);return pl(o)&&pl(r.Ae)?Gm(c):fu(r.serializer,c)}(n,e)}function VC(n,e,t){return n instanceof qs?Ym(n,e):n instanceof ai?Xm(n,e):t}function Qm(n,e){return n instanceof ci?function(s){return pl(s)||function(i){return!!i&&"doubleValue"in i}(s)}(e)?e:{integerValue:0}:null}class oi extends ba{}class qs extends ba{constructor(e){super(),this.elements=e}}function Ym(n,e){const t=Jm(e);for(const s of n.elements)t.some(r=>Ft(r,s))||t.push(s);return{arrayValue:{values:t}}}class ai extends ba{constructor(e){super(),this.elements=e}}function Xm(n,e){let t=Jm(e);for(const s of n.elements)t=t.filter(r=>!Ft(r,s));return{arrayValue:{values:t}}}class ci extends ba{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function Vf(n){return ye(n.integerValue||n.doubleValue)}function Jm(n){return lu(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pu{constructor(e,t){this.field=e,this.transform=t}}function LC(n,e){return n.field.isEqual(e.field)&&function(s,r){return s instanceof qs&&r instanceof qs||s instanceof ai&&r instanceof ai?Vs(s.elements,r.elements,Ft):s instanceof ci&&r instanceof ci?Ft(s.Ae,r.Ae):s instanceof oi&&r instanceof oi}(n.transform,e.transform)}class FC{constructor(e,t){this.version=e,this.transformResults=t}}class Xe{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Xe}static exists(e){return new Xe(void 0,e)}static updateTime(e){return new Xe(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function vo(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Pa{}function Zm(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new ka(n.key,Xe.none()):new Ii(n.key,n.data,Xe.none());{const t=n.data,s=tt.empty();let r=new be(xe.comparator);for(let i of e.fields)if(!r.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?s.delete(i):s.set(i,o),r=r.add(i)}return new Fn(n.key,s,new at(r.toArray()),Xe.none())}}function UC(n,e,t){n instanceof Ii?function(r,i,o){const c=r.value.clone(),l=Ff(r.fieldTransforms,i,o.transformResults);c.setAll(l),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(n,e,t):n instanceof Fn?function(r,i,o){if(!vo(r.precondition,i))return void i.convertToUnknownDocument(o.version);const c=Ff(r.fieldTransforms,i,o.transformResults),l=i.data;l.setAll(eg(r)),l.setAll(c),i.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(n,e,t):function(r,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Wr(n,e,t,s){return n instanceof Ii?function(i,o,c,l){if(!vo(i.precondition,o))return c;const u=i.value.clone(),d=Uf(i.fieldTransforms,l,o);return u.setAll(d),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null}(n,e,t,s):n instanceof Fn?function(i,o,c,l){if(!vo(i.precondition,o))return c;const u=Uf(i.fieldTransforms,l,o),d=o.data;return d.setAll(eg(i)),d.setAll(u),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(n,e,t,s):function(i,o,c){return vo(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c}(n,e,t)}function BC(n,e){let t=null;for(const s of n.fieldTransforms){const r=e.data.field(s.field),i=Qm(s.transform,r||null);i!=null&&(t===null&&(t=tt.empty()),t.set(s.field,i))}return t||null}function Lf(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(s,r){return s===void 0&&r===void 0||!(!s||!r)&&Vs(s,r,(i,o)=>LC(i,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Ii extends Pa{constructor(e,t,s,r=[]){super(),this.key=e,this.value=t,this.precondition=s,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class Fn extends Pa{constructor(e,t,s,r,i=[]){super(),this.key=e,this.data=t,this.fieldMask=s,this.precondition=r,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function eg(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const s=n.data.field(t);e.set(t,s)}}),e}function Ff(n,e,t){const s=new Map;ne(n.length===t.length,32656,{Re:t.length,Ve:n.length});for(let r=0;r<t.length;r++){const i=n[r],o=i.transform,c=e.data.field(i.field);s.set(i.field,VC(o,c,t[r]))}return s}function Uf(n,e,t){const s=new Map;for(const r of n){const i=r.transform,o=t.data.field(r.field);s.set(r.field,MC(i,o,e))}return s}class ka extends Pa{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class qC extends Pa{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $C{constructor(e,t,s,r){this.batchId=e,this.localWriteTime=t,this.baseMutations=s,this.mutations=r}applyToRemoteDocument(e,t){const s=t.mutationResults;for(let r=0;r<this.mutations.length;r++){const i=this.mutations[r];i.key.isEqual(e.key)&&UC(i,e,s[r])}}applyToLocalView(e,t){for(const s of this.baseMutations)s.key.isEqual(e.key)&&(t=Wr(s,e,t,this.localWriteTime));for(const s of this.mutations)s.key.isEqual(e.key)&&(t=Wr(s,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const s=zm();return this.mutations.forEach(r=>{const i=e.get(r.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(r.key)?null:c;const l=Zm(o,c);l!==null&&s.set(r.key,l),o.isValidDocument()||o.convertToNoDocument(H.min())}),s}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Z())}isEqual(e){return this.batchId===e.batchId&&Vs(this.mutations,e.mutations,(t,s)=>Lf(t,s))&&Vs(this.baseMutations,e.baseMutations,(t,s)=>Lf(t,s))}}class _u{constructor(e,t,s,r){this.batch=e,this.commitVersion=t,this.mutationResults=s,this.docVersions=r}static from(e,t,s){ne(e.mutations.length===s.length,58842,{me:e.mutations.length,fe:s.length});let r=function(){return NC}();const i=e.mutations;for(let o=0;o<i.length;o++)r=r.insert(i[o].key,s[o].version);return new _u(e,t,s,r)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jC{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WC{constructor(e,t,s){this.alias=e,this.aggregateType=t,this.fieldPath=s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HC{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Te,ee;function zC(n){switch(n){case P.OK:return q(64938);case P.CANCELLED:case P.UNKNOWN:case P.DEADLINE_EXCEEDED:case P.RESOURCE_EXHAUSTED:case P.INTERNAL:case P.UNAVAILABLE:case P.UNAUTHENTICATED:return!1;case P.INVALID_ARGUMENT:case P.NOT_FOUND:case P.ALREADY_EXISTS:case P.PERMISSION_DENIED:case P.FAILED_PRECONDITION:case P.ABORTED:case P.OUT_OF_RANGE:case P.UNIMPLEMENTED:case P.DATA_LOSS:return!0;default:return q(15467,{code:n})}}function tg(n){if(n===void 0)return Qt("GRPC error has no .code"),P.UNKNOWN;switch(n){case Te.OK:return P.OK;case Te.CANCELLED:return P.CANCELLED;case Te.UNKNOWN:return P.UNKNOWN;case Te.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case Te.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case Te.INTERNAL:return P.INTERNAL;case Te.UNAVAILABLE:return P.UNAVAILABLE;case Te.UNAUTHENTICATED:return P.UNAUTHENTICATED;case Te.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case Te.NOT_FOUND:return P.NOT_FOUND;case Te.ALREADY_EXISTS:return P.ALREADY_EXISTS;case Te.PERMISSION_DENIED:return P.PERMISSION_DENIED;case Te.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case Te.ABORTED:return P.ABORTED;case Te.OUT_OF_RANGE:return P.OUT_OF_RANGE;case Te.UNIMPLEMENTED:return P.UNIMPLEMENTED;case Te.DATA_LOSS:return P.DATA_LOSS;default:return q(39323,{code:n})}}(ee=Te||(Te={}))[ee.OK=0]="OK",ee[ee.CANCELLED=1]="CANCELLED",ee[ee.UNKNOWN=2]="UNKNOWN",ee[ee.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ee[ee.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ee[ee.NOT_FOUND=5]="NOT_FOUND",ee[ee.ALREADY_EXISTS=6]="ALREADY_EXISTS",ee[ee.PERMISSION_DENIED=7]="PERMISSION_DENIED",ee[ee.UNAUTHENTICATED=16]="UNAUTHENTICATED",ee[ee.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ee[ee.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ee[ee.ABORTED=10]="ABORTED",ee[ee.OUT_OF_RANGE=11]="OUT_OF_RANGE",ee[ee.UNIMPLEMENTED=12]="UNIMPLEMENTED",ee[ee.INTERNAL=13]="INTERNAL",ee[ee.UNAVAILABLE=14]="UNAVAILABLE",ee[ee.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GC(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KC=new En([4294967295,4294967295],0);function Bf(n){const e=GC().encode(n),t=new fm;return t.update(e),new Uint8Array(t.digest())}function qf(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),s=e.getUint32(4,!0),r=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new En([t,s],0),new En([r,i],0)]}class mu{constructor(e,t,s){if(this.bitmap=e,this.padding=t,this.hashCount=s,t<0||t>=8)throw new Ur(`Invalid padding: ${t}`);if(s<0)throw new Ur(`Invalid hash count: ${s}`);if(e.length>0&&this.hashCount===0)throw new Ur(`Invalid hash count: ${s}`);if(e.length===0&&t!==0)throw new Ur(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=En.fromNumber(this.ge)}ye(e,t,s){let r=e.add(t.multiply(En.fromNumber(s)));return r.compare(KC)===1&&(r=new En([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=Bf(e),[s,r]=qf(t);for(let i=0;i<this.hashCount;i++){const o=this.ye(s,r,i);if(!this.we(o))return!1}return!0}static create(e,t,s){const r=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new mu(i,r,t);return s.forEach(c=>o.insert(c)),o}insert(e){if(this.ge===0)return;const t=Bf(e),[s,r]=qf(t);for(let i=0;i<this.hashCount;i++){const o=this.ye(s,r,i);this.Se(o)}}Se(e){const t=Math.floor(e/8),s=e%8;this.bitmap[t]|=1<<s}}class Ur extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Na{constructor(e,t,s,r,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=s,this.documentUpdates=r,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,s){const r=new Map;return r.set(e,Ai.createSynthesizedTargetChangeForCurrentChange(e,t,s)),new Na(H.min(),r,new Ie(J),Yt(),Z())}}class Ai{constructor(e,t,s,r,i){this.resumeToken=e,this.current=t,this.addedDocuments=s,this.modifiedDocuments=r,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,s){return new Ai(s,t,Z(),Z(),Z())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wo{constructor(e,t,s,r){this.be=e,this.removedTargetIds=t,this.key=s,this.De=r}}class ng{constructor(e,t){this.targetId=e,this.Ce=t}}class sg{constructor(e,t,s=Me.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=t,this.resumeToken=s,this.cause=r}}class $f{constructor(){this.ve=0,this.Fe=jf(),this.Me=Me.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Z(),t=Z(),s=Z();return this.Fe.forEach((r,i)=>{switch(i){case 0:e=e.add(r);break;case 2:t=t.add(r);break;case 1:s=s.add(r);break;default:q(38017,{changeType:i})}}),new Ai(this.Me,this.xe,e,t,s)}qe(){this.Oe=!1,this.Fe=jf()}Qe(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}$e(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}Ue(){this.ve+=1}Ke(){this.ve-=1,ne(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class QC{constructor(e){this.Ge=e,this.ze=new Map,this.je=Yt(),this.Je=ao(),this.He=ao(),this.Ye=new Ie(J)}Ze(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Xe(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,t=>{const s=this.nt(t);switch(e.state){case 0:this.rt(t)&&s.Le(e.resumeToken);break;case 1:s.Ke(),s.Ne||s.qe(),s.Le(e.resumeToken);break;case 2:s.Ke(),s.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(s.We(),s.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),s.Le(e.resumeToken));break;default:q(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach((s,r)=>{this.rt(r)&&t(r)})}st(e){const t=e.targetId,s=e.Ce.count,r=this.ot(t);if(r){const i=r.target;if(ml(i))if(s===0){const o=new L(i.path);this.et(t,o,Be.newNoDocument(o,H.min()))}else ne(s===1,20013,{expectedCount:s});else{const o=this._t(t);if(o!==s){const c=this.ut(e),l=c?this.ct(c,e,o):1;if(l!==0){this.it(t);const u=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(t,u)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:s="",padding:r=0},hashCount:i=0}=t;let o,c;try{o=Sn(s).toUint8Array()}catch(l){if(l instanceof Sm)return ts("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new mu(o,r,i)}catch(l){return ts(l instanceof Ur?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.ge===0?null:c}ct(e,t,s){return t.Ce.count===s-this.Pt(e,t.targetId)?0:2}Pt(e,t){const s=this.Ge.getRemoteKeysForTarget(t);let r=0;return s.forEach(i=>{const o=this.Ge.ht(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.et(t,i,null),r++)}),r}Tt(e){const t=new Map;this.ze.forEach((i,o)=>{const c=this.ot(o);if(c){if(i.current&&ml(c.target)){const l=new L(c.target.path);this.It(l).has(o)||this.Et(o,l)||this.et(o,l,Be.newNoDocument(l,e))}i.Be&&(t.set(o,i.ke()),i.qe())}});let s=Z();this.He.forEach((i,o)=>{let c=!0;o.forEachWhile(l=>{const u=this.ot(l);return!u||u.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(s=s.add(i))}),this.je.forEach((i,o)=>o.setReadTime(e));const r=new Na(e,t,this.Ye,this.je,s);return this.je=Yt(),this.Je=ao(),this.He=ao(),this.Ye=new Ie(J),r}Xe(e,t){if(!this.rt(e))return;const s=this.Et(e,t.key)?2:0;this.nt(e).Qe(t.key,s),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.He=this.He.insert(t.key,this.dt(t.key).add(e))}et(e,t,s){if(!this.rt(e))return;const r=this.nt(e);this.Et(e,t)?r.Qe(t,1):r.$e(t),this.He=this.He.insert(t,this.dt(t).delete(e)),this.He=this.He.insert(t,this.dt(t).add(e)),s&&(this.je=this.je.insert(t,s))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Ue(e){this.nt(e).Ue()}nt(e){let t=this.ze.get(e);return t||(t=new $f,this.ze.set(e,t)),t}dt(e){let t=this.He.get(e);return t||(t=new be(J),this.He=this.He.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new be(J),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||M("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new $f),this.Ge.getRemoteKeysForTarget(e).forEach(t=>{this.et(e,t,null)})}Et(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function ao(){return new Ie(L.comparator)}function jf(){return new Ie(L.comparator)}const YC={asc:"ASCENDING",desc:"DESCENDING"},XC={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},JC={and:"AND",or:"OR"};class ZC{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function yl(n,e){return n.useProto3Json||wa(e)?e:{value:e}}function Bo(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function rg(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function eR(n,e){return Bo(n,e.toTimestamp())}function Mt(n){return ne(!!n,49232),H.fromTimestamp(function(t){const s=Rn(t);return new le(s.seconds,s.nanos)}(n))}function gu(n,e){return El(n,e).canonicalString()}function El(n,e){const t=function(r){return new oe(["projects",r.projectId,"databases",r.database])}(n).child("documents");return e===void 0?t:t.child(e)}function ig(n){const e=oe.fromString(n);return ne(hg(e),10190,{key:e.toString()}),e}function Tl(n,e){return gu(n.databaseId,e.path)}function Uc(n,e){const t=ig(e);if(t.get(1)!==n.databaseId.projectId)throw new O(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new O(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new L(ag(t))}function og(n,e){return gu(n.databaseId,e)}function tR(n){const e=ig(n);return e.length===4?oe.emptyPath():ag(e)}function vl(n){return new oe(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function ag(n){return ne(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Wf(n,e,t){return{name:Tl(n,e),fields:t.value.mapValue.fields}}function nR(n,e){let t;if("targetChange"in e){e.targetChange;const s=function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:q(39313,{state:u})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],i=function(u,d){return u.useProto3Json?(ne(d===void 0||typeof d=="string",58123),Me.fromBase64String(d||"")):(ne(d===void 0||d instanceof Buffer||d instanceof Uint8Array,16193),Me.fromUint8Array(d||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&function(u){const d=u.code===void 0?P.UNKNOWN:tg(u.code);return new O(d,u.message||"")}(o);t=new sg(s,r,i,c||null)}else if("documentChange"in e){e.documentChange;const s=e.documentChange;s.document,s.document.name,s.document.updateTime;const r=Uc(n,s.document.name),i=Mt(s.document.updateTime),o=s.document.createTime?Mt(s.document.createTime):H.min(),c=new tt({mapValue:{fields:s.document.fields}}),l=Be.newFoundDocument(r,i,o,c),u=s.targetIds||[],d=s.removedTargetIds||[];t=new wo(u,d,l.key,l)}else if("documentDelete"in e){e.documentDelete;const s=e.documentDelete;s.document;const r=Uc(n,s.document),i=s.readTime?Mt(s.readTime):H.min(),o=Be.newNoDocument(r,i),c=s.removedTargetIds||[];t=new wo([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const s=e.documentRemove;s.document;const r=Uc(n,s.document),i=s.removedTargetIds||[];t=new wo([],i,r,null)}else{if(!("filter"in e))return q(11601,{Rt:e});{e.filter;const s=e.filter;s.targetId;const{count:r=0,unchangedNames:i}=s,o=new HC(r,i),c=s.targetId;t=new ng(c,o)}}return t}function sR(n,e){let t;if(e instanceof Ii)t={update:Wf(n,e.key,e.value)};else if(e instanceof ka)t={delete:Tl(n,e.key)};else if(e instanceof Fn)t={update:Wf(n,e.key,e.data),updateMask:dR(e.fieldMask)};else{if(!(e instanceof qC))return q(16599,{Vt:e.type});t={verify:Tl(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(s=>function(i,o){const c=o.transform;if(c instanceof oi)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof qs)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof ai)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof ci)return{fieldPath:o.field.canonicalString(),increment:c.Ae};throw q(20930,{transform:o.transform})}(0,s))),e.precondition.isNone||(t.currentDocument=function(r,i){return i.updateTime!==void 0?{updateTime:eR(r,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:q(27497)}(n,e.precondition)),t}function rR(n,e){return n&&n.length>0?(ne(e!==void 0,14353),n.map(t=>function(r,i){let o=r.updateTime?Mt(r.updateTime):Mt(i);return o.isEqual(H.min())&&(o=Mt(i)),new FC(o,r.transformResults||[])}(t,e))):[]}function iR(n,e){return{documents:[og(n,e.path)]}}function cg(n,e){const t={structuredQuery:{}},s=e.path;let r;e.collectionGroup!==null?(r=s,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=s.popLast(),t.structuredQuery.from=[{collectionId:s.lastSegment()}]),t.parent=og(n,r);const i=function(u){if(u.length!==0)return ug(It.create(u,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(u){if(u.length!==0)return u.map(d=>function(_){return{field:hn(_.field),direction:lR(_.dir)}}(d))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=yl(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(u){return{before:u.inclusive,values:u.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(u){return{before:!u.inclusive,values:u.position}}(e.endAt)),{ft:t,parent:r}}function oR(n,e,t,s){const{ft:r,parent:i}=cg(n,e),o={},c=[];let l=0;return t.forEach(u=>{const d="aggregate_"+l++;o[d]=u.alias,u.aggregateType==="count"?c.push({alias:d,count:{}}):u.aggregateType==="avg"?c.push({alias:d,avg:{field:hn(u.fieldPath)}}):u.aggregateType==="sum"&&c.push({alias:d,sum:{field:hn(u.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:c,structuredQuery:r.structuredQuery},parent:r.parent},gt:o,parent:i}}function aR(n){let e=tR(n.parent);const t=n.structuredQuery,s=t.from?t.from.length:0;let r=null;if(s>0){ne(s===1,65062);const d=t.from[0];d.allDescendants?r=d.collectionId:e=e.child(d.collectionId)}let i=[];t.where&&(i=function(p){const _=lg(p);return _ instanceof It&&Lm(_)?_.getFilters():[_]}(t.where));let o=[];t.orderBy&&(o=function(p){return p.map(_=>function(C){return new ii(ws(C.field),function(b){switch(b){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(_))}(t.orderBy));let c=null;t.limit&&(c=function(p){let _;return _=typeof p=="object"?p.value:p,wa(_)?null:_}(t.limit));let l=null;t.startAt&&(l=function(p){const _=!!p.before,E=p.values||[];return new Bs(E,_)}(t.startAt));let u=null;return t.endAt&&(u=function(p){const _=!p.before,E=p.values||[];return new Bs(E,_)}(t.endAt)),RC(e,r,o,i,c,"F",l,u)}function cR(n,e){const t=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return q(28987,{purpose:r})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function lg(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const s=ws(t.unaryFilter.field);return ve.create(s,"==",{doubleValue:NaN});case"IS_NULL":const r=ws(t.unaryFilter.field);return ve.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=ws(t.unaryFilter.field);return ve.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=ws(t.unaryFilter.field);return ve.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return q(61313);default:return q(60726)}}(n):n.fieldFilter!==void 0?function(t){return ve.create(ws(t.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return q(58110);default:return q(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return It.create(t.compositeFilter.filters.map(s=>lg(s)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return q(1026)}}(t.compositeFilter.op))}(n):q(30097,{filter:n})}function lR(n){return YC[n]}function uR(n){return XC[n]}function hR(n){return JC[n]}function hn(n){return{fieldPath:n.canonicalString()}}function ws(n){return xe.fromServerFormat(n.fieldPath)}function ug(n){return n instanceof ve?function(t){if(t.op==="=="){if(Nf(t.value))return{unaryFilter:{field:hn(t.field),op:"IS_NAN"}};if(kf(t.value))return{unaryFilter:{field:hn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Nf(t.value))return{unaryFilter:{field:hn(t.field),op:"IS_NOT_NAN"}};if(kf(t.value))return{unaryFilter:{field:hn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:hn(t.field),op:uR(t.op),value:t.value}}}(n):n instanceof It?function(t){const s=t.getFilters().map(r=>ug(r));return s.length===1?s[0]:{compositeFilter:{op:hR(t.op),filters:s}}}(n):q(54877,{filter:n})}function dR(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function hg(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(e,t,s,r,i=H.min(),o=H.min(),c=Me.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=s,this.sequenceNumber=r,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new fn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new fn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new fn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new fn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fR{constructor(e){this.yt=e}}function pR(n){const e=aR({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Uo(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _R{constructor(){this.Cn=new mR}addToCollectionParentIndex(e,t){return this.Cn.add(t),N.resolve()}getCollectionParents(e,t){return N.resolve(this.Cn.getEntries(t))}addFieldIndex(e,t){return N.resolve()}deleteFieldIndex(e,t){return N.resolve()}deleteAllFieldIndexes(e){return N.resolve()}createTargetIndexes(e,t){return N.resolve()}getDocumentsMatchingTarget(e,t){return N.resolve(null)}getIndexType(e,t){return N.resolve(0)}getFieldIndexes(e,t){return N.resolve([])}getNextCollectionGroupToUpdate(e){return N.resolve(null)}getMinOffset(e,t){return N.resolve(Cn.min())}getMinOffsetFromCollectionGroup(e,t){return N.resolve(Cn.min())}updateCollectionGroup(e,t,s){return N.resolve()}updateIndexEntries(e,t){return N.resolve()}}class mR{constructor(){this.index={}}add(e){const t=e.lastSegment(),s=e.popLast(),r=this.index[t]||new be(oe.comparator),i=!r.has(s);return this.index[t]=r.add(s),i}has(e){const t=e.lastSegment(),s=e.popLast(),r=this.index[t];return r&&r.has(s)}getEntries(e){return(this.index[e]||new be(oe.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hf={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},dg=41943040;class et{static withCacheSize(e){return new et(e,et.DEFAULT_COLLECTION_PERCENTILE,et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,s){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */et.DEFAULT_COLLECTION_PERCENTILE=10,et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,et.DEFAULT=new et(dg,et.DEFAULT_COLLECTION_PERCENTILE,et.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),et.DISABLED=new et(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $s{constructor(e){this.ar=e}next(){return this.ar+=2,this.ar}static ur(){return new $s(0)}static cr(){return new $s(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zf="LruGarbageCollector",gR=1048576;function Gf([n,e],[t,s]){const r=J(n,t);return r===0?J(e,s):r}class yR{constructor(e){this.Ir=e,this.buffer=new be(Gf),this.Er=0}dr(){return++this.Er}Ar(e){const t=[e,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(t);else{const s=this.buffer.last();Gf(t,s)<0&&(this.buffer=this.buffer.delete(s).add(t))}}get maxValue(){return this.buffer.last()[0]}}class ER{constructor(e,t,s){this.garbageCollector=e,this.asyncQueue=t,this.localStore=s,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Vr(e){M(zf,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){ir(t)?M(zf,"Ignoring IndexedDB error during garbage collection: ",t):await rr(t)}await this.Vr(3e5)})}}class TR{constructor(e,t){this.mr=e,this.params=t}calculateTargetCount(e,t){return this.mr.gr(e).next(s=>Math.floor(t/100*s))}nthSequenceNumber(e,t){if(t===0)return N.resolve(va.ce);const s=new yR(t);return this.mr.forEachTarget(e,r=>s.Ar(r.sequenceNumber)).next(()=>this.mr.pr(e,r=>s.Ar(r))).next(()=>s.maxValue)}removeTargets(e,t,s){return this.mr.removeTargets(e,t,s)}removeOrphanedDocuments(e,t){return this.mr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(M("LruGarbageCollector","Garbage collection skipped; disabled"),N.resolve(Hf)):this.getCacheSize(e).next(s=>s<this.params.cacheSizeCollectionThreshold?(M("LruGarbageCollector",`Garbage collection skipped; Cache size ${s} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Hf):this.yr(e,t))}getCacheSize(e){return this.mr.getCacheSize(e)}yr(e,t){let s,r,i,o,c,l,u;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(M("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),r=this.params.maximumSequenceNumbersToCollect):r=p,o=Date.now(),this.nthSequenceNumber(e,r))).next(p=>(s=p,c=Date.now(),this.removeTargets(e,s,t))).next(p=>(i=p,l=Date.now(),this.removeOrphanedDocuments(e,s))).next(p=>(u=Date.now(),Ts()<=X.DEBUG&&M("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-d}ms
	Determined least recently used ${r} in `+(c-o)+`ms
	Removed ${i} targets in `+(l-c)+`ms
	Removed ${p} documents in `+(u-l)+`ms
Total Duration: ${u-d}ms`),N.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:i,documentsRemoved:p})))}}function vR(n,e){return new TR(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wR{constructor(){this.changes=new ls(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Be.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const s=this.changes.get(t);return s!==void 0?N.resolve(s):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IR{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AR{constructor(e,t,s,r){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=s,this.indexManager=r}getDocument(e,t){let s=null;return this.documentOverlayCache.getOverlay(e,t).next(r=>(s=r,this.remoteDocumentCache.getEntry(e,t))).next(r=>(s!==null&&Wr(s.mutation,r,at.empty(),le.now()),r))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(s=>this.getLocalViewOfDocuments(e,s,Z()).next(()=>s))}getLocalViewOfDocuments(e,t,s=Z()){const r=Qn();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,s).next(i=>{let o=Fr();return i.forEach((c,l)=>{o=o.insert(c,l.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const s=Qn();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,Z()))}populateOverlays(e,t,s){const r=[];return s.forEach(i=>{t.has(i)||r.push(i)}),this.documentOverlayCache.getOverlays(e,r).next(i=>{i.forEach((o,c)=>{t.set(o,c)})})}computeViews(e,t,s,r){let i=Yt();const o=jr(),c=function(){return jr()}();return t.forEach((l,u)=>{const d=s.get(u.key);r.has(u.key)&&(d===void 0||d.mutation instanceof Fn)?i=i.insert(u.key,u):d!==void 0?(o.set(u.key,d.mutation.getFieldMask()),Wr(d.mutation,u,d.mutation.getFieldMask(),le.now())):o.set(u.key,at.empty())}),this.recalculateAndSaveOverlays(e,i).next(l=>(l.forEach((u,d)=>o.set(u,d)),t.forEach((u,d)=>c.set(u,new IR(d,o.get(u)??null))),c))}recalculateAndSaveOverlays(e,t){const s=jr();let r=new Ie((o,c)=>o-c),i=Z();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const c of o)c.keys().forEach(l=>{const u=t.get(l);if(u===null)return;let d=s.get(l)||at.empty();d=c.applyToLocalView(u,d),s.set(l,d);const p=(r.get(c.batchId)||Z()).add(l);r=r.insert(c.batchId,p)})}).next(()=>{const o=[],c=r.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),u=l.key,d=l.value,p=zm();d.forEach(_=>{if(!i.has(_)){const E=Zm(t.get(_),s.get(_));E!==null&&p.set(_,E),i=i.add(_)}}),o.push(this.documentOverlayCache.saveOverlays(e,u,p))}return N.waitFor(o)}).next(()=>s)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(s=>this.recalculateAndSaveOverlays(e,s))}getDocumentsMatchingQuery(e,t,s,r){return function(o){return L.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):du(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,s,r):this.getDocumentsMatchingCollectionQuery(e,t,s,r)}getNextDocuments(e,t,s,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,s,r).next(i=>{const o=r-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,s.largestBatchId,r-i.size):N.resolve(Qn());let c=ni,l=i;return o.next(u=>N.forEach(u,(d,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),i.get(d)?N.resolve():this.remoteDocumentCache.getEntry(e,d).next(_=>{l=l.insert(d,_)}))).next(()=>this.populateOverlays(e,u,i)).next(()=>this.computeViews(e,l,u,Z())).next(d=>({batchId:c,changes:Hm(d)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new L(t)).next(s=>{let r=Fr();return s.isFoundDocument()&&(r=r.insert(s.key,s)),r})}getDocumentsMatchingCollectionGroupQuery(e,t,s,r){const i=t.collectionGroup;let o=Fr();return this.indexManager.getCollectionParents(e,i).next(c=>N.forEach(c,l=>{const u=function(p,_){return new cs(_,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,u,s,r).next(d=>{d.forEach((p,_)=>{o=o.insert(p,_)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,s,r){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,s.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,s,i,r))).next(o=>{i.forEach((l,u)=>{const d=u.getKey();o.get(d)===null&&(o=o.insert(d,Be.newInvalidDocument(d)))});let c=Fr();return o.forEach((l,u)=>{const d=i.get(l);d!==void 0&&Wr(d.mutation,u,at.empty(),le.now()),Sa(t,u)&&(c=c.insert(l,u))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CR{constructor(e){this.serializer=e,this.Lr=new Map,this.kr=new Map}getBundleMetadata(e,t){return N.resolve(this.Lr.get(t))}saveBundleMetadata(e,t){return this.Lr.set(t.id,function(r){return{id:r.id,version:r.version,createTime:Mt(r.createTime)}}(t)),N.resolve()}getNamedQuery(e,t){return N.resolve(this.kr.get(t))}saveNamedQuery(e,t){return this.kr.set(t.name,function(r){return{name:r.name,query:pR(r.bundledQuery),readTime:Mt(r.readTime)}}(t)),N.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RR{constructor(){this.overlays=new Ie(L.comparator),this.qr=new Map}getOverlay(e,t){return N.resolve(this.overlays.get(t))}getOverlays(e,t){const s=Qn();return N.forEach(t,r=>this.getOverlay(e,r).next(i=>{i!==null&&s.set(r,i)})).next(()=>s)}saveOverlays(e,t,s){return s.forEach((r,i)=>{this.St(e,t,i)}),N.resolve()}removeOverlaysForBatchId(e,t,s){const r=this.qr.get(s);return r!==void 0&&(r.forEach(i=>this.overlays=this.overlays.remove(i)),this.qr.delete(s)),N.resolve()}getOverlaysForCollection(e,t,s){const r=Qn(),i=t.length+1,o=new L(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const l=c.getNext().value,u=l.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===i&&l.largestBatchId>s&&r.set(l.getKey(),l)}return N.resolve(r)}getOverlaysForCollectionGroup(e,t,s,r){let i=new Ie((u,d)=>u-d);const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>s){let d=i.get(u.largestBatchId);d===null&&(d=Qn(),i=i.insert(u.largestBatchId,d)),d.set(u.getKey(),u)}}const c=Qn(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((u,d)=>c.set(u,d)),!(c.size()>=r)););return N.resolve(c)}St(e,t,s){const r=this.overlays.get(s.key);if(r!==null){const o=this.qr.get(r.largestBatchId).delete(s.key);this.qr.set(r.largestBatchId,o)}this.overlays=this.overlays.insert(s.key,new jC(t,s));let i=this.qr.get(t);i===void 0&&(i=Z(),this.qr.set(t,i)),this.qr.set(t,i.add(s.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SR{constructor(){this.sessionToken=Me.EMPTY_BYTE_STRING}getSessionToken(e){return N.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,N.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yu{constructor(){this.Qr=new be(Ne.$r),this.Ur=new be(Ne.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(e,t){const s=new Ne(e,t);this.Qr=this.Qr.add(s),this.Ur=this.Ur.add(s)}Wr(e,t){e.forEach(s=>this.addReference(s,t))}removeReference(e,t){this.Gr(new Ne(e,t))}zr(e,t){e.forEach(s=>this.removeReference(s,t))}jr(e){const t=new L(new oe([])),s=new Ne(t,e),r=new Ne(t,e+1),i=[];return this.Ur.forEachInRange([s,r],o=>{this.Gr(o),i.push(o.key)}),i}Jr(){this.Qr.forEach(e=>this.Gr(e))}Gr(e){this.Qr=this.Qr.delete(e),this.Ur=this.Ur.delete(e)}Hr(e){const t=new L(new oe([])),s=new Ne(t,e),r=new Ne(t,e+1);let i=Z();return this.Ur.forEachInRange([s,r],o=>{i=i.add(o.key)}),i}containsKey(e){const t=new Ne(e,0),s=this.Qr.firstAfterOrEqual(t);return s!==null&&e.isEqual(s.key)}}class Ne{constructor(e,t){this.key=e,this.Yr=t}static $r(e,t){return L.comparator(e.key,t.key)||J(e.Yr,t.Yr)}static Kr(e,t){return J(e.Yr,t.Yr)||L.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bR{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.tr=1,this.Zr=new be(Ne.$r)}checkEmpty(e){return N.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,s,r){const i=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new $C(i,t,s,r);this.mutationQueue.push(o);for(const c of r)this.Zr=this.Zr.add(new Ne(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return N.resolve(o)}lookupMutationBatch(e,t){return N.resolve(this.Xr(t))}getNextMutationBatchAfterBatchId(e,t){const s=t+1,r=this.ei(s),i=r<0?0:r;return N.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return N.resolve(this.mutationQueue.length===0?cu:this.tr-1)}getAllMutationBatches(e){return N.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const s=new Ne(t,0),r=new Ne(t,Number.POSITIVE_INFINITY),i=[];return this.Zr.forEachInRange([s,r],o=>{const c=this.Xr(o.Yr);i.push(c)}),N.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let s=new be(J);return t.forEach(r=>{const i=new Ne(r,0),o=new Ne(r,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([i,o],c=>{s=s.add(c.Yr)})}),N.resolve(this.ti(s))}getAllMutationBatchesAffectingQuery(e,t){const s=t.path,r=s.length+1;let i=s;L.isDocumentKey(i)||(i=i.child(""));const o=new Ne(new L(i),0);let c=new be(J);return this.Zr.forEachWhile(l=>{const u=l.key.path;return!!s.isPrefixOf(u)&&(u.length===r&&(c=c.add(l.Yr)),!0)},o),N.resolve(this.ti(c))}ti(e){const t=[];return e.forEach(s=>{const r=this.Xr(s);r!==null&&t.push(r)}),t}removeMutationBatch(e,t){ne(this.ni(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let s=this.Zr;return N.forEach(t.mutations,r=>{const i=new Ne(r.key,t.batchId);return s=s.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Zr=s})}ir(e){}containsKey(e,t){const s=new Ne(t,0),r=this.Zr.firstAfterOrEqual(s);return N.resolve(t.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,N.resolve()}ni(e,t){return this.ei(e)}ei(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Xr(e){const t=this.ei(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PR{constructor(e){this.ri=e,this.docs=function(){return new Ie(L.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const s=t.key,r=this.docs.get(s),i=r?r.size:0,o=this.ri(t);return this.docs=this.docs.insert(s,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,s.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const s=this.docs.get(t);return N.resolve(s?s.document.mutableCopy():Be.newInvalidDocument(t))}getEntries(e,t){let s=Yt();return t.forEach(r=>{const i=this.docs.get(r);s=s.insert(r,i?i.document.mutableCopy():Be.newInvalidDocument(r))}),N.resolve(s)}getDocumentsMatchingQuery(e,t,s,r){let i=Yt();const o=t.path,c=new L(o.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:u,value:{document:d}}=l.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||sC(nC(d),s)<=0||(r.has(d.key)||Sa(t,d))&&(i=i.insert(d.key,d.mutableCopy()))}return N.resolve(i)}getAllFromCollectionGroup(e,t,s,r){q(9500)}ii(e,t){return N.forEach(this.docs,s=>t(s))}newChangeBuffer(e){return new kR(this)}getSize(e){return N.resolve(this.size)}}class kR extends wR{constructor(e){super(),this.Nr=e}applyChanges(e){const t=[];return this.changes.forEach((s,r)=>{r.isValidDocument()?t.push(this.Nr.addEntry(e,r)):this.Nr.removeEntry(s)}),N.waitFor(t)}getFromCache(e,t){return this.Nr.getEntry(e,t)}getAllFromCache(e,t){return this.Nr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NR{constructor(e){this.persistence=e,this.si=new ls(t=>uu(t),hu),this.lastRemoteSnapshotVersion=H.min(),this.highestTargetId=0,this.oi=0,this._i=new yu,this.targetCount=0,this.ai=$s.ur()}forEachTarget(e,t){return this.si.forEach((s,r)=>t(r)),N.resolve()}getLastRemoteSnapshotVersion(e){return N.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return N.resolve(this.oi)}allocateTargetId(e){return this.highestTargetId=this.ai.next(),N.resolve(this.highestTargetId)}setTargetsMetadata(e,t,s){return s&&(this.lastRemoteSnapshotVersion=s),t>this.oi&&(this.oi=t),N.resolve()}Pr(e){this.si.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.ai=new $s(t),this.highestTargetId=t),e.sequenceNumber>this.oi&&(this.oi=e.sequenceNumber)}addTargetData(e,t){return this.Pr(t),this.targetCount+=1,N.resolve()}updateTargetData(e,t){return this.Pr(t),N.resolve()}removeTargetData(e,t){return this.si.delete(t.target),this._i.jr(t.targetId),this.targetCount-=1,N.resolve()}removeTargets(e,t,s){let r=0;const i=[];return this.si.forEach((o,c)=>{c.sequenceNumber<=t&&s.get(c.targetId)===null&&(this.si.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),r++)}),N.waitFor(i).next(()=>r)}getTargetCount(e){return N.resolve(this.targetCount)}getTargetData(e,t){const s=this.si.get(t)||null;return N.resolve(s)}addMatchingKeys(e,t,s){return this._i.Wr(t,s),N.resolve()}removeMatchingKeys(e,t,s){this._i.zr(t,s);const r=this.persistence.referenceDelegate,i=[];return r&&t.forEach(o=>{i.push(r.markPotentiallyOrphaned(e,o))}),N.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this._i.jr(t),N.resolve()}getMatchingKeysForTargetId(e,t){const s=this._i.Hr(t);return N.resolve(s)}containsKey(e,t){return N.resolve(this._i.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fg{constructor(e,t){this.ui={},this.overlays={},this.ci=new va(0),this.li=!1,this.li=!0,this.hi=new SR,this.referenceDelegate=e(this),this.Pi=new NR(this),this.indexManager=new _R,this.remoteDocumentCache=function(r){return new PR(r)}(s=>this.referenceDelegate.Ti(s)),this.serializer=new fR(t),this.Ii=new CR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new RR,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let s=this.ui[e.toKey()];return s||(s=new bR(t,this.referenceDelegate),this.ui[e.toKey()]=s),s}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(e,t,s){M("MemoryPersistence","Starting transaction:",e);const r=new DR(this.ci.next());return this.referenceDelegate.Ei(),s(r).next(i=>this.referenceDelegate.di(r).next(()=>i)).toPromise().then(i=>(r.raiseOnCommittedEvent(),i))}Ai(e,t){return N.or(Object.values(this.ui).map(s=>()=>s.containsKey(e,t)))}}class DR extends iC{constructor(e){super(),this.currentSequenceNumber=e}}class Eu{constructor(e){this.persistence=e,this.Ri=new yu,this.Vi=null}static mi(e){return new Eu(e)}get fi(){if(this.Vi)return this.Vi;throw q(60996)}addReference(e,t,s){return this.Ri.addReference(s,t),this.fi.delete(s.toString()),N.resolve()}removeReference(e,t,s){return this.Ri.removeReference(s,t),this.fi.add(s.toString()),N.resolve()}markPotentiallyOrphaned(e,t){return this.fi.add(t.toString()),N.resolve()}removeTarget(e,t){this.Ri.jr(t.targetId).forEach(r=>this.fi.add(r.toString()));const s=this.persistence.getTargetCache();return s.getMatchingKeysForTargetId(e,t.targetId).next(r=>{r.forEach(i=>this.fi.add(i.toString()))}).next(()=>s.removeTargetData(e,t))}Ei(){this.Vi=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return N.forEach(this.fi,s=>{const r=L.fromPath(s);return this.gi(e,r).next(i=>{i||t.removeEntry(r,H.min())})}).next(()=>(this.Vi=null,t.apply(e)))}updateLimboDocument(e,t){return this.gi(e,t).next(s=>{s?this.fi.delete(t.toString()):this.fi.add(t.toString())})}Ti(e){return 0}gi(e,t){return N.or([()=>N.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ai(e,t)])}}class qo{constructor(e,t){this.persistence=e,this.pi=new ls(s=>cC(s.path),(s,r)=>s.isEqual(r)),this.garbageCollector=vR(this,t)}static mi(e,t){return new qo(e,t)}Ei(){}di(e){return N.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}gr(e){const t=this.wr(e);return this.persistence.getTargetCache().getTargetCount(e).next(s=>t.next(r=>s+r))}wr(e){let t=0;return this.pr(e,s=>{t++}).next(()=>t)}pr(e,t){return N.forEach(this.pi,(s,r)=>this.br(e,s,r).next(i=>i?N.resolve():t(r)))}removeTargets(e,t,s){return this.persistence.getTargetCache().removeTargets(e,t,s)}removeOrphanedDocuments(e,t){let s=0;const r=this.persistence.getRemoteDocumentCache(),i=r.newChangeBuffer();return r.ii(e,o=>this.br(e,o,t).next(c=>{c||(s++,i.removeEntry(o,H.min()))})).next(()=>i.apply(e)).next(()=>s)}markPotentiallyOrphaned(e,t){return this.pi.set(t,e.currentSequenceNumber),N.resolve()}removeTarget(e,t){const s=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,s)}addReference(e,t,s){return this.pi.set(s,e.currentSequenceNumber),N.resolve()}removeReference(e,t,s){return this.pi.set(s,e.currentSequenceNumber),N.resolve()}updateLimboDocument(e,t){return this.pi.set(t,e.currentSequenceNumber),N.resolve()}Ti(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Eo(e.data.value)),t}br(e,t,s){return N.or([()=>this.persistence.Ai(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const r=this.pi.get(t);return N.resolve(r!==void 0&&r>s)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tu{constructor(e,t,s,r){this.targetId=e,this.fromCache=t,this.Es=s,this.ds=r}static As(e,t){let s=Z(),r=Z();for(const i of t.docChanges)switch(i.type){case 0:s=s.add(i.doc.key);break;case 1:r=r.add(i.doc.key)}return new Tu(e,t.fromCache,s,r)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OR{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xR{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=function(){return OT()?8:oC($e())>0?6:4}()}initialize(e,t){this.ps=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,s,r){const i={result:null};return this.ys(e,t).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.ws(e,t,r,s).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new OR;return this.Ss(e,t,o).next(c=>{if(i.result=c,this.Vs)return this.bs(e,t,o,c.size)})}).next(()=>i.result)}bs(e,t,s,r){return s.documentReadCount<this.fs?(Ts()<=X.DEBUG&&M("QueryEngine","SDK will not create cache indexes for query:",vs(t),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),N.resolve()):(Ts()<=X.DEBUG&&M("QueryEngine","Query:",vs(t),"scans",s.documentReadCount,"local documents and returns",r,"documents as results."),s.documentReadCount>this.gs*r?(Ts()<=X.DEBUG&&M("QueryEngine","The SDK decides to create cache indexes for query:",vs(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,xt(t))):N.resolve())}ys(e,t){if(Mf(t))return N.resolve(null);let s=xt(t);return this.indexManager.getIndexType(e,s).next(r=>r===0?null:(t.limit!==null&&r===1&&(t=Uo(t,null,"F"),s=xt(t)),this.indexManager.getDocumentsMatchingTarget(e,s).next(i=>{const o=Z(...i);return this.ps.getDocuments(e,o).next(c=>this.indexManager.getMinOffset(e,s).next(l=>{const u=this.Ds(t,c);return this.Cs(t,u,o,l.readTime)?this.ys(e,Uo(t,null,"F")):this.vs(e,u,t,l)}))})))}ws(e,t,s,r){return Mf(t)||r.isEqual(H.min())?N.resolve(null):this.ps.getDocuments(e,s).next(i=>{const o=this.Ds(t,i);return this.Cs(t,o,s,r)?N.resolve(null):(Ts()<=X.DEBUG&&M("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),vs(t)),this.vs(e,o,t,tC(r,ni)).next(c=>c))})}Ds(e,t){let s=new be(jm(e));return t.forEach((r,i)=>{Sa(e,i)&&(s=s.add(i))}),s}Cs(e,t,s,r){if(e.limit===null)return!1;if(s.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(r)>0)}Ss(e,t,s){return Ts()<=X.DEBUG&&M("QueryEngine","Using full collection scan to execute query:",vs(t)),this.ps.getDocumentsMatchingQuery(e,t,Cn.min(),s)}vs(e,t,s,r){return this.ps.getDocumentsMatchingQuery(e,s,r).next(i=>(t.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vu="LocalStore",MR=3e8;class VR{constructor(e,t,s,r){this.persistence=e,this.Fs=t,this.serializer=r,this.Ms=new Ie(J),this.xs=new ls(i=>uu(i),hu),this.Os=new Map,this.Ns=e.getRemoteDocumentCache(),this.Pi=e.getTargetCache(),this.Ii=e.getBundleCache(),this.Bs(s)}Bs(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new AR(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Ms))}}function LR(n,e,t,s){return new VR(n,e,t,s)}async function pg(n,e){const t=W(n);return await t.persistence.runTransaction("Handle user change","readonly",s=>{let r;return t.mutationQueue.getAllMutationBatches(s).next(i=>(r=i,t.Bs(e),t.mutationQueue.getAllMutationBatches(s))).next(i=>{const o=[],c=[];let l=Z();for(const u of r){o.push(u.batchId);for(const d of u.mutations)l=l.add(d.key)}for(const u of i){c.push(u.batchId);for(const d of u.mutations)l=l.add(d.key)}return t.localDocuments.getDocuments(s,l).next(u=>({Ls:u,removedBatchIds:o,addedBatchIds:c}))})})}function FR(n,e){const t=W(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",s=>{const r=e.batch.keys(),i=t.Ns.newChangeBuffer({trackRemovals:!0});return function(c,l,u,d){const p=u.batch,_=p.keys();let E=N.resolve();return _.forEach(C=>{E=E.next(()=>d.getEntry(l,C)).next(k=>{const b=u.docVersions.get(C);ne(b!==null,48541),k.version.compareTo(b)<0&&(p.applyToRemoteDocument(k,u),k.isValidDocument()&&(k.setReadTime(u.commitVersion),d.addEntry(k)))})}),E.next(()=>c.mutationQueue.removeMutationBatch(l,p))}(t,s,e,i).next(()=>i.apply(s)).next(()=>t.mutationQueue.performConsistencyCheck(s)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(s,r,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(s,function(c){let l=Z();for(let u=0;u<c.mutationResults.length;++u)c.mutationResults[u].transformResults.length>0&&(l=l.add(c.batch.mutations[u].key));return l}(e))).next(()=>t.localDocuments.getDocuments(s,r))})}function _g(n){const e=W(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Pi.getLastRemoteSnapshotVersion(t))}function UR(n,e){const t=W(n),s=e.snapshotVersion;let r=t.Ms;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=t.Ns.newChangeBuffer({trackRemovals:!0});r=t.Ms;const c=[];e.targetChanges.forEach((d,p)=>{const _=r.get(p);if(!_)return;c.push(t.Pi.removeMatchingKeys(i,d.removedDocuments,p).next(()=>t.Pi.addMatchingKeys(i,d.addedDocuments,p)));let E=_.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?E=E.withResumeToken(Me.EMPTY_BYTE_STRING,H.min()).withLastLimboFreeSnapshotVersion(H.min()):d.resumeToken.approximateByteSize()>0&&(E=E.withResumeToken(d.resumeToken,s)),r=r.insert(p,E),function(k,b,V){return k.resumeToken.approximateByteSize()===0||b.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=MR?!0:V.addedDocuments.size+V.modifiedDocuments.size+V.removedDocuments.size>0}(_,E,d)&&c.push(t.Pi.updateTargetData(i,E))});let l=Yt(),u=Z();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,d))}),c.push(BR(i,o,e.documentUpdates).next(d=>{l=d.ks,u=d.qs})),!s.isEqual(H.min())){const d=t.Pi.getLastRemoteSnapshotVersion(i).next(p=>t.Pi.setTargetsMetadata(i,i.currentSequenceNumber,s));c.push(d)}return N.waitFor(c).next(()=>o.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,l,u)).next(()=>l)}).then(i=>(t.Ms=r,i))}function BR(n,e,t){let s=Z(),r=Z();return t.forEach(i=>s=s.add(i)),e.getEntries(n,s).next(i=>{let o=Yt();return t.forEach((c,l)=>{const u=i.get(c);l.isFoundDocument()!==u.isFoundDocument()&&(r=r.add(c)),l.isNoDocument()&&l.version.isEqual(H.min())?(e.removeEntry(c,l.readTime),o=o.insert(c,l)):!u.isValidDocument()||l.version.compareTo(u.version)>0||l.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(l),o=o.insert(c,l)):M(vu,"Ignoring outdated watch update for ",c,". Current version:",u.version," Watch version:",l.version)}),{ks:o,qs:r}})}function qR(n,e){const t=W(n);return t.persistence.runTransaction("Get next mutation batch","readonly",s=>(e===void 0&&(e=cu),t.mutationQueue.getNextMutationBatchAfterBatchId(s,e)))}function $R(n,e){const t=W(n);return t.persistence.runTransaction("Allocate target","readwrite",s=>{let r;return t.Pi.getTargetData(s,e).next(i=>i?(r=i,N.resolve(r)):t.Pi.allocateTargetId(s).next(o=>(r=new fn(e,o,"TargetPurposeListen",s.currentSequenceNumber),t.Pi.addTargetData(s,r).next(()=>r))))}).then(s=>{const r=t.Ms.get(s.targetId);return(r===null||s.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(t.Ms=t.Ms.insert(s.targetId,s),t.xs.set(e,s.targetId)),s})}async function wl(n,e,t){const s=W(n),r=s.Ms.get(e),i=t?"readwrite":"readwrite-primary";try{t||await s.persistence.runTransaction("Release target",i,o=>s.persistence.referenceDelegate.removeTarget(o,r))}catch(o){if(!ir(o))throw o;M(vu,`Failed to update sequence numbers for target ${e}: ${o}`)}s.Ms=s.Ms.remove(e),s.xs.delete(r.target)}function Kf(n,e,t){const s=W(n);let r=H.min(),i=Z();return s.persistence.runTransaction("Execute query","readwrite",o=>function(l,u,d){const p=W(l),_=p.xs.get(d);return _!==void 0?N.resolve(p.Ms.get(_)):p.Pi.getTargetData(u,d)}(s,o,xt(e)).next(c=>{if(c)return r=c.lastLimboFreeSnapshotVersion,s.Pi.getMatchingKeysForTargetId(o,c.targetId).next(l=>{i=l})}).next(()=>s.Fs.getDocumentsMatchingQuery(o,e,t?r:H.min(),t?i:Z())).next(c=>(jR(s,bC(e),c),{documents:c,Qs:i})))}function jR(n,e,t){let s=n.Os.get(e)||H.min();t.forEach((r,i)=>{i.readTime.compareTo(s)>0&&(s=i.readTime)}),n.Os.set(e,s)}class Qf{constructor(){this.activeTargetIds=xC()}zs(e){this.activeTargetIds=this.activeTargetIds.add(e)}js(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Gs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class WR{constructor(){this.Mo=new Qf,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,s){}addLocalQueryTarget(e,t=!0){return t&&this.Mo.zs(e),this.xo[e]||"not-current"}updateQueryState(e,t,s){this.xo[e]=t}removeLocalQueryTarget(e){this.Mo.js(e)}isLocalQueryTarget(e){return this.Mo.activeTargetIds.has(e)}clearQueryState(e){delete this.xo[e]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(e){return this.Mo.activeTargetIds.has(e)}start(){return this.Mo=new Qf,Promise.resolve()}handleUserChange(e,t,s){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HR{Oo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yf="ConnectivityMonitor";class Xf{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(e){this.qo.push(e)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){M(Yf,"Network connectivity changed: AVAILABLE");for(const e of this.qo)e(0)}ko(){M(Yf,"Network connectivity changed: UNAVAILABLE");for(const e of this.qo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let co=null;function Il(){return co===null?co=function(){return 268435456+Math.round(2147483648*Math.random())}():co++,"0x"+co.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bc="RestConnection",zR={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class GR{get $o(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.Uo=t+"://"+e.host,this.Ko=`projects/${s}/databases/${r}`,this.Wo=this.databaseId.database===Vo?`project_id=${s}`:`project_id=${s}&database_id=${r}`}Go(e,t,s,r,i){const o=Il(),c=this.zo(e,t.toUriEncodedString());M(Bc,`Sending RPC '${e}' ${o}:`,c,s);const l={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(l,r,i);const{host:u}=new URL(c),d=ft(u);return this.Jo(e,c,l,s,d).then(p=>(M(Bc,`Received RPC '${e}' ${o}: `,p),p),p=>{throw ts(Bc,`RPC '${e}' ${o} failed with error: `,p,"url: ",c,"request:",s),p})}Ho(e,t,s,r,i,o){return this.Go(e,t,s,r,i)}jo(e,t,s){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+sr}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((r,i)=>e[i]=r),s&&s.headers.forEach((r,i)=>e[i]=r)}zo(e,t){const s=zR[e];return`${this.Uo}/v1/${t}:${s}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KR{constructor(e){this.Yo=e.Yo,this.Zo=e.Zo}Xo(e){this.e_=e}t_(e){this.n_=e}r_(e){this.i_=e}onMessage(e){this.s_=e}close(){this.Zo()}send(e){this.Yo(e)}o_(){this.e_()}__(){this.n_()}a_(e){this.i_(e)}u_(e){this.s_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fe="WebChannelConnection";class QR extends GR{constructor(e){super(e),this.c_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,t,s,r,i){const o=Il();return new Promise((c,l)=>{const u=new pm;u.setWithCredentials(!0),u.listenOnce(_m.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case yo.NO_ERROR:const p=u.getResponseJson();M(Fe,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),c(p);break;case yo.TIMEOUT:M(Fe,`RPC '${e}' ${o} timed out`),l(new O(P.DEADLINE_EXCEEDED,"Request time out"));break;case yo.HTTP_ERROR:const _=u.getStatus();if(M(Fe,`RPC '${e}' ${o} failed with status:`,_,"response text:",u.getResponseText()),_>0){let E=u.getResponseJson();Array.isArray(E)&&(E=E[0]);const C=E==null?void 0:E.error;if(C&&C.status&&C.message){const k=function(V){const F=V.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(F)>=0?F:P.UNKNOWN}(C.status);l(new O(k,C.message))}else l(new O(P.UNKNOWN,"Server responded with status "+u.getStatus()))}else l(new O(P.UNAVAILABLE,"Connection failed."));break;default:q(9055,{l_:e,streamId:o,h_:u.getLastErrorCode(),P_:u.getLastError()})}}finally{M(Fe,`RPC '${e}' ${o} completed.`)}});const d=JSON.stringify(r);M(Fe,`RPC '${e}' ${o} sending request:`,r),u.send(t,"POST",d,s,15)})}T_(e,t,s){const r=Il(),i=[this.Uo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=ym(),c=gm(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(l.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(l.useFetchStreams=!0),this.jo(l.initMessageHeaders,t,s),l.encodeInitMessageHeaders=!0;const d=i.join("");M(Fe,`Creating RPC '${e}' stream ${r}: ${d}`,l);const p=o.createWebChannel(d,l);this.I_(p);let _=!1,E=!1;const C=new KR({Yo:b=>{E?M(Fe,`Not sending because RPC '${e}' stream ${r} is closed:`,b):(_||(M(Fe,`Opening RPC '${e}' stream ${r} transport.`),p.open(),_=!0),M(Fe,`RPC '${e}' stream ${r} sending:`,b),p.send(b))},Zo:()=>p.close()}),k=(b,V,F)=>{b.listen(V,U=>{try{F(U)}catch(K){setTimeout(()=>{throw K},0)}})};return k(p,Lr.EventType.OPEN,()=>{E||(M(Fe,`RPC '${e}' stream ${r} transport opened.`),C.o_())}),k(p,Lr.EventType.CLOSE,()=>{E||(E=!0,M(Fe,`RPC '${e}' stream ${r} transport closed`),C.a_(),this.E_(p))}),k(p,Lr.EventType.ERROR,b=>{E||(E=!0,ts(Fe,`RPC '${e}' stream ${r} transport errored. Name:`,b.name,"Message:",b.message),C.a_(new O(P.UNAVAILABLE,"The operation could not be completed")))}),k(p,Lr.EventType.MESSAGE,b=>{var V;if(!E){const F=b.data[0];ne(!!F,16349);const U=F,K=(U==null?void 0:U.error)||((V=U[0])==null?void 0:V.error);if(K){M(Fe,`RPC '${e}' stream ${r} received error:`,K);const Ee=K.status;let ae=function(T){const I=Te[T];if(I!==void 0)return tg(I)}(Ee),w=K.message;ae===void 0&&(ae=P.INTERNAL,w="Unknown error status: "+Ee+" with message "+K.message),E=!0,C.a_(new O(ae,w)),p.close()}else M(Fe,`RPC '${e}' stream ${r} received:`,F),C.u_(F)}}),k(c,mm.STAT_EVENT,b=>{b.stat===ul.PROXY?M(Fe,`RPC '${e}' stream ${r} detected buffering proxy`):b.stat===ul.NOPROXY&&M(Fe,`RPC '${e}' stream ${r} detected no buffering proxy`)}),setTimeout(()=>{C.__()},0),C}terminate(){this.c_.forEach(e=>e.close()),this.c_=[]}I_(e){this.c_.push(e)}E_(e){this.c_=this.c_.filter(t=>t===e)}}function qc(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Da(n){return new ZC(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mg{constructor(e,t,s=1e3,r=1.5,i=6e4){this.Mi=e,this.timerId=t,this.d_=s,this.A_=r,this.R_=i,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const t=Math.floor(this.V_+this.y_()),s=Math.max(0,Date.now()-this.f_),r=Math.max(0,t-s);r>0&&M("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${s} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jf="PersistentStream";class gg{constructor(e,t,s,r,i,o,c,l){this.Mi=e,this.S_=s,this.b_=r,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new mg(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.Q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===P.RESOURCE_EXHAUSTED?(Qt(t.toString()),Qt("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===P.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.K_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.r_(t)}K_(){}auth(){this.state=1;const e=this.W_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([s,r])=>{this.D_===t&&this.G_(s,r)},s=>{e(()=>{const r=new O(P.UNKNOWN,"Fetching auth token failed: "+s.message);return this.z_(r)})})}G_(e,t){const s=this.W_(this.D_);this.stream=this.j_(e,t),this.stream.Xo(()=>{s(()=>this.listener.Xo())}),this.stream.t_(()=>{s(()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.t_()))}),this.stream.r_(r=>{s(()=>this.z_(r))}),this.stream.onMessage(r=>{s(()=>++this.F_==1?this.J_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return M(Jf,`close with error: ${e}`),this.stream=null,this.close(4,e)}W_(e){return t=>{this.Mi.enqueueAndForget(()=>this.D_===e?t():(M(Jf,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class YR extends gg{constructor(e,t,s,r,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,s,r,o),this.serializer=i}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=nR(this.serializer,e),s=function(i){if(!("targetChange"in i))return H.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?H.min():o.readTime?Mt(o.readTime):H.min()}(e);return this.listener.H_(t,s)}Y_(e){const t={};t.database=vl(this.serializer),t.addTarget=function(i,o){let c;const l=o.target;if(c=ml(l)?{documents:iR(i,l)}:{query:cg(i,l).ft},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=rg(i,o.resumeToken);const u=yl(i,o.expectedCount);u!==null&&(c.expectedCount=u)}else if(o.snapshotVersion.compareTo(H.min())>0){c.readTime=Bo(i,o.snapshotVersion.toTimestamp());const u=yl(i,o.expectedCount);u!==null&&(c.expectedCount=u)}return c}(this.serializer,e);const s=cR(this.serializer,e);s&&(t.labels=s),this.q_(t)}Z_(e){const t={};t.database=vl(this.serializer),t.removeTarget=e,this.q_(t)}}class XR extends gg{constructor(e,t,s,r,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,s,r,o),this.serializer=i}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return ne(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,ne(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){ne(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=rR(e.writeResults,e.commitTime),s=Mt(e.commitTime);return this.listener.na(s,t)}ra(){const e={};e.database=vl(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map(s=>sR(this.serializer,s))};this.q_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JR{}class ZR extends JR{constructor(e,t,s,r){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=s,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new O(P.FAILED_PRECONDITION,"The client has already been terminated.")}Go(e,t,s,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Go(e,El(t,s),r,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new O(P.UNKNOWN,i.toString())})}Ho(e,t,s,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.Ho(e,El(t,s),r,o,c,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new O(P.UNKNOWN,o.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}class eS{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Qt(t),this.aa=!1):M("OnlineStateTracker",t)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ns="RemoteStore";class tS{constructor(e,t,s,r,i){this.localStore=e,this.datastore=t,this.asyncQueue=s,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=i,this.Aa.Oo(o=>{s.enqueueAndForget(async()=>{us(this)&&(M(ns,"Restarting streams for network reachability change."),await async function(l){const u=W(l);u.Ea.add(4),await Ci(u),u.Ra.set("Unknown"),u.Ea.delete(4),await Oa(u)}(this))})}),this.Ra=new eS(s,r)}}async function Oa(n){if(us(n))for(const e of n.da)await e(!0)}async function Ci(n){for(const e of n.da)await e(!1)}function yg(n,e){const t=W(n);t.Ia.has(e.targetId)||(t.Ia.set(e.targetId,e),Cu(t)?Au(t):or(t).O_()&&Iu(t,e))}function wu(n,e){const t=W(n),s=or(t);t.Ia.delete(e),s.O_()&&Eg(t,e),t.Ia.size===0&&(s.O_()?s.L_():us(t)&&t.Ra.set("Unknown"))}function Iu(n,e){if(n.Va.Ue(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(H.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}or(n).Y_(e)}function Eg(n,e){n.Va.Ue(e),or(n).Z_(e)}function Au(n){n.Va=new QC({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),At:e=>n.Ia.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),or(n).start(),n.Ra.ua()}function Cu(n){return us(n)&&!or(n).x_()&&n.Ia.size>0}function us(n){return W(n).Ea.size===0}function Tg(n){n.Va=void 0}async function nS(n){n.Ra.set("Online")}async function sS(n){n.Ia.forEach((e,t)=>{Iu(n,e)})}async function rS(n,e){Tg(n),Cu(n)?(n.Ra.ha(e),Au(n)):n.Ra.set("Unknown")}async function iS(n,e,t){if(n.Ra.set("Online"),e instanceof sg&&e.state===2&&e.cause)try{await async function(r,i){const o=i.cause;for(const c of i.targetIds)r.Ia.has(c)&&(await r.remoteSyncer.rejectListen(c,o),r.Ia.delete(c),r.Va.removeTarget(c))}(n,e)}catch(s){M(ns,"Failed to remove targets %s: %s ",e.targetIds.join(","),s),await $o(n,s)}else if(e instanceof wo?n.Va.Ze(e):e instanceof ng?n.Va.st(e):n.Va.tt(e),!t.isEqual(H.min()))try{const s=await _g(n.localStore);t.compareTo(s)>=0&&await function(i,o){const c=i.Va.Tt(o);return c.targetChanges.forEach((l,u)=>{if(l.resumeToken.approximateByteSize()>0){const d=i.Ia.get(u);d&&i.Ia.set(u,d.withResumeToken(l.resumeToken,o))}}),c.targetMismatches.forEach((l,u)=>{const d=i.Ia.get(l);if(!d)return;i.Ia.set(l,d.withResumeToken(Me.EMPTY_BYTE_STRING,d.snapshotVersion)),Eg(i,l);const p=new fn(d.target,l,u,d.sequenceNumber);Iu(i,p)}),i.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(s){M(ns,"Failed to raise snapshot:",s),await $o(n,s)}}async function $o(n,e,t){if(!ir(e))throw e;n.Ea.add(1),await Ci(n),n.Ra.set("Offline"),t||(t=()=>_g(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{M(ns,"Retrying IndexedDB access"),await t(),n.Ea.delete(1),await Oa(n)})}function vg(n,e){return e().catch(t=>$o(n,t,e))}async function xa(n){const e=W(n),t=Pn(e);let s=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:cu;for(;oS(e);)try{const r=await qR(e.localStore,s);if(r===null){e.Ta.length===0&&t.L_();break}s=r.batchId,aS(e,r)}catch(r){await $o(e,r)}wg(e)&&Ig(e)}function oS(n){return us(n)&&n.Ta.length<10}function aS(n,e){n.Ta.push(e);const t=Pn(n);t.O_()&&t.X_&&t.ea(e.mutations)}function wg(n){return us(n)&&!Pn(n).x_()&&n.Ta.length>0}function Ig(n){Pn(n).start()}async function cS(n){Pn(n).ra()}async function lS(n){const e=Pn(n);for(const t of n.Ta)e.ea(t.mutations)}async function uS(n,e,t){const s=n.Ta.shift(),r=_u.from(s,e,t);await vg(n,()=>n.remoteSyncer.applySuccessfulWrite(r)),await xa(n)}async function hS(n,e){e&&Pn(n).X_&&await async function(s,r){if(function(o){return zC(o)&&o!==P.ABORTED}(r.code)){const i=s.Ta.shift();Pn(s).B_(),await vg(s,()=>s.remoteSyncer.rejectFailedWrite(i.batchId,r)),await xa(s)}}(n,e),wg(n)&&Ig(n)}async function Zf(n,e){const t=W(n);t.asyncQueue.verifyOperationInProgress(),M(ns,"RemoteStore received new credentials");const s=us(t);t.Ea.add(3),await Ci(t),s&&t.Ra.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ea.delete(3),await Oa(t)}async function dS(n,e){const t=W(n);e?(t.Ea.delete(2),await Oa(t)):e||(t.Ea.add(2),await Ci(t),t.Ra.set("Unknown"))}function or(n){return n.ma||(n.ma=function(t,s,r){const i=W(t);return i.sa(),new YR(s,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,r)}(n.datastore,n.asyncQueue,{Xo:nS.bind(null,n),t_:sS.bind(null,n),r_:rS.bind(null,n),H_:iS.bind(null,n)}),n.da.push(async e=>{e?(n.ma.B_(),Cu(n)?Au(n):n.Ra.set("Unknown")):(await n.ma.stop(),Tg(n))})),n.ma}function Pn(n){return n.fa||(n.fa=function(t,s,r){const i=W(t);return i.sa(),new XR(s,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,r)}(n.datastore,n.asyncQueue,{Xo:()=>Promise.resolve(),t_:cS.bind(null,n),r_:hS.bind(null,n),ta:lS.bind(null,n),na:uS.bind(null,n)}),n.da.push(async e=>{e?(n.fa.B_(),await xa(n)):(await n.fa.stop(),n.Ta.length>0&&(M(ns,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))})),n.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ru{constructor(e,t,s,r,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=s,this.op=r,this.removalCallback=i,this.deferred=new Ot,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,s,r,i){const o=Date.now()+s,c=new Ru(e,t,o,r,i);return c.start(s),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new O(P.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Su(n,e){if(Qt("AsyncQueue",`${e}: ${n}`),ir(n))return new O(P.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ns{static emptySet(e){return new Ns(e.comparator)}constructor(e){this.comparator=e?(t,s)=>e(t,s)||L.comparator(t.key,s.key):(t,s)=>L.comparator(t.key,s.key),this.keyedMap=Fr(),this.sortedSet=new Ie(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,s)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Ns)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),s=e.sortedSet.getIterator();for(;t.hasNext();){const r=t.getNext().key,i=s.getNext().key;if(!r.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const s=new Ns;return s.comparator=this.comparator,s.keyedMap=e,s.sortedSet=t,s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ep{constructor(){this.ga=new Ie(L.comparator)}track(e){const t=e.doc.key,s=this.ga.get(t);s?e.type!==0&&s.type===3?this.ga=this.ga.insert(t,e):e.type===3&&s.type!==1?this.ga=this.ga.insert(t,{type:s.type,doc:e.doc}):e.type===2&&s.type===2?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):e.type===2&&s.type===0?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):e.type===1&&s.type===0?this.ga=this.ga.remove(t):e.type===1&&s.type===2?this.ga=this.ga.insert(t,{type:1,doc:s.doc}):e.type===0&&s.type===1?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):q(63341,{Rt:e,pa:s}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal((t,s)=>{e.push(s)}),e}}class js{constructor(e,t,s,r,i,o,c,l,u){this.query=e,this.docs=t,this.oldDocs=s,this.docChanges=r,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=u}static fromInitialDocuments(e,t,s,r,i){const o=[];return t.forEach(c=>{o.push({type:0,doc:c})}),new js(e,t,Ns.emptySet(t),o,s,r,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Ra(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,s=e.docChanges;if(t.length!==s.length)return!1;for(let r=0;r<t.length;r++)if(t[r].type!==s[r].type||!t[r].doc.isEqual(s[r].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fS{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class pS{constructor(){this.queries=tp(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(t,s){const r=W(t),i=r.queries;r.queries=tp(),i.forEach((o,c)=>{for(const l of c.Sa)l.onError(s)})})(this,new O(P.ABORTED,"Firestore shutting down"))}}function tp(){return new ls(n=>$m(n),Ra)}async function bu(n,e){const t=W(n);let s=3;const r=e.query;let i=t.queries.get(r);i?!i.ba()&&e.Da()&&(s=2):(i=new fS,s=e.Da()?0:1);try{switch(s){case 0:i.wa=await t.onListen(r,!0);break;case 1:i.wa=await t.onListen(r,!1);break;case 2:await t.onFirstRemoteStoreListen(r)}}catch(o){const c=Su(o,`Initialization of query '${vs(e.query)}' failed`);return void e.onError(c)}t.queries.set(r,i),i.Sa.push(e),e.va(t.onlineState),i.wa&&e.Fa(i.wa)&&ku(t)}async function Pu(n,e){const t=W(n),s=e.query;let r=3;const i=t.queries.get(s);if(i){const o=i.Sa.indexOf(e);o>=0&&(i.Sa.splice(o,1),i.Sa.length===0?r=e.Da()?0:1:!i.ba()&&e.Da()&&(r=2))}switch(r){case 0:return t.queries.delete(s),t.onUnlisten(s,!0);case 1:return t.queries.delete(s),t.onUnlisten(s,!1);case 2:return t.onLastRemoteStoreUnlisten(s);default:return}}function _S(n,e){const t=W(n);let s=!1;for(const r of e){const i=r.query,o=t.queries.get(i);if(o){for(const c of o.Sa)c.Fa(r)&&(s=!0);o.wa=r}}s&&ku(t)}function mS(n,e,t){const s=W(n),r=s.queries.get(e);if(r)for(const i of r.Sa)i.onError(t);s.queries.delete(e)}function ku(n){n.Ca.forEach(e=>{e.next()})}var Al,np;(np=Al||(Al={})).Ma="default",np.Cache="cache";class Nu{constructor(e,t,s){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=s||{}}Fa(e){if(!this.options.includeMetadataChanges){const s=[];for(const r of e.docChanges)r.type!==3&&s.push(r);e=new js(e.query,e.docs,e.oldDocs,s,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache||!this.Da())return!0;const s=t!=="Offline";return(!this.options.qa||!s)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}ka(e){e=js.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==Al.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ag{constructor(e){this.key=e}}class Cg{constructor(e){this.key=e}}class gS{constructor(e,t){this.query=e,this.Ya=t,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=Z(),this.mutatedKeys=Z(),this.eu=jm(e),this.tu=new Ns(this.eu)}get nu(){return this.Ya}ru(e,t){const s=t?t.iu:new ep,r=t?t.tu:this.tu;let i=t?t.mutatedKeys:this.mutatedKeys,o=r,c=!1;const l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,u=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((d,p)=>{const _=r.get(d),E=Sa(this.query,p)?p:null,C=!!_&&this.mutatedKeys.has(_.key),k=!!E&&(E.hasLocalMutations||this.mutatedKeys.has(E.key)&&E.hasCommittedMutations);let b=!1;_&&E?_.data.isEqual(E.data)?C!==k&&(s.track({type:3,doc:E}),b=!0):this.su(_,E)||(s.track({type:2,doc:E}),b=!0,(l&&this.eu(E,l)>0||u&&this.eu(E,u)<0)&&(c=!0)):!_&&E?(s.track({type:0,doc:E}),b=!0):_&&!E&&(s.track({type:1,doc:_}),b=!0,(l||u)&&(c=!0)),b&&(E?(o=o.add(E),i=k?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const d=this.query.limitType==="F"?o.last():o.first();o=o.delete(d.key),i=i.delete(d.key),s.track({type:1,doc:d})}return{tu:o,iu:s,Cs:c,mutatedKeys:i}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,s,r){const i=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const o=e.iu.ya();o.sort((d,p)=>function(E,C){const k=b=>{switch(b){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return q(20277,{Rt:b})}};return k(E)-k(C)}(d.type,p.type)||this.eu(d.doc,p.doc)),this.ou(s),r=r??!1;const c=t&&!r?this._u():[],l=this.Xa.size===0&&this.current&&!r?1:0,u=l!==this.Za;return this.Za=l,o.length!==0||u?{snapshot:new js(this.query,e.tu,i,o,e.mutatedKeys,l===0,u,!1,!!s&&s.resumeToken.approximateByteSize()>0),au:c}:{au:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new ep,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(e){return!this.Ya.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(t=>this.Ya=this.Ya.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ya=this.Ya.delete(t)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Xa;this.Xa=Z(),this.tu.forEach(s=>{this.uu(s.key)&&(this.Xa=this.Xa.add(s.key))});const t=[];return e.forEach(s=>{this.Xa.has(s)||t.push(new Cg(s))}),this.Xa.forEach(s=>{e.has(s)||t.push(new Ag(s))}),t}cu(e){this.Ya=e.Qs,this.Xa=Z();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return js.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Za===0,this.hasCachedResults)}}const Du="SyncEngine";class yS{constructor(e,t,s){this.query=e,this.targetId=t,this.view=s}}class ES{constructor(e){this.key=e,this.hu=!1}}class TS{constructor(e,t,s,r,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=s,this.sharedClientState=r,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Pu={},this.Tu=new ls(c=>$m(c),Ra),this.Iu=new Map,this.Eu=new Set,this.du=new Ie(L.comparator),this.Au=new Map,this.Ru=new yu,this.Vu={},this.mu=new Map,this.fu=$s.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function vS(n,e,t=!0){const s=Ng(n);let r;const i=s.Tu.get(e);return i?(s.sharedClientState.addLocalQueryTarget(i.targetId),r=i.view.lu()):r=await Rg(s,e,t,!0),r}async function wS(n,e){const t=Ng(n);await Rg(t,e,!0,!1)}async function Rg(n,e,t,s){const r=await $R(n.localStore,xt(e)),i=r.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let c;return s&&(c=await IS(n,e,i,o==="current",r.resumeToken)),n.isPrimaryClient&&t&&yg(n.remoteStore,r),c}async function IS(n,e,t,s,r){n.pu=(p,_,E)=>async function(k,b,V,F){let U=b.view.ru(V);U.Cs&&(U=await Kf(k.localStore,b.query,!1).then(({documents:w})=>b.view.ru(w,U)));const K=F&&F.targetChanges.get(b.targetId),Ee=F&&F.targetMismatches.get(b.targetId)!=null,ae=b.view.applyChanges(U,k.isPrimaryClient,K,Ee);return rp(k,b.targetId,ae.au),ae.snapshot}(n,p,_,E);const i=await Kf(n.localStore,e,!0),o=new gS(e,i.Qs),c=o.ru(i.documents),l=Ai.createSynthesizedTargetChangeForCurrentChange(t,s&&n.onlineState!=="Offline",r),u=o.applyChanges(c,n.isPrimaryClient,l);rp(n,t,u.au);const d=new yS(e,t,o);return n.Tu.set(e,d),n.Iu.has(t)?n.Iu.get(t).push(e):n.Iu.set(t,[e]),u.snapshot}async function AS(n,e,t){const s=W(n),r=s.Tu.get(e),i=s.Iu.get(r.targetId);if(i.length>1)return s.Iu.set(r.targetId,i.filter(o=>!Ra(o,e))),void s.Tu.delete(e);s.isPrimaryClient?(s.sharedClientState.removeLocalQueryTarget(r.targetId),s.sharedClientState.isActiveQueryTarget(r.targetId)||await wl(s.localStore,r.targetId,!1).then(()=>{s.sharedClientState.clearQueryState(r.targetId),t&&wu(s.remoteStore,r.targetId),Cl(s,r.targetId)}).catch(rr)):(Cl(s,r.targetId),await wl(s.localStore,r.targetId,!0))}async function CS(n,e){const t=W(n),s=t.Tu.get(e),r=t.Iu.get(s.targetId);t.isPrimaryClient&&r.length===1&&(t.sharedClientState.removeLocalQueryTarget(s.targetId),wu(t.remoteStore,s.targetId))}async function RS(n,e,t){const s=OS(n);try{const r=await function(o,c){const l=W(o),u=le.now(),d=c.reduce((E,C)=>E.add(C.key),Z());let p,_;return l.persistence.runTransaction("Locally write mutations","readwrite",E=>{let C=Yt(),k=Z();return l.Ns.getEntries(E,d).next(b=>{C=b,C.forEach((V,F)=>{F.isValidDocument()||(k=k.add(V))})}).next(()=>l.localDocuments.getOverlayedDocuments(E,C)).next(b=>{p=b;const V=[];for(const F of c){const U=BC(F,p.get(F.key).overlayedDocument);U!=null&&V.push(new Fn(F.key,U,xm(U.value.mapValue),Xe.exists(!0)))}return l.mutationQueue.addMutationBatch(E,u,V,c)}).next(b=>{_=b;const V=b.applyToLocalDocumentSet(p,k);return l.documentOverlayCache.saveOverlays(E,b.batchId,V)})}).then(()=>({batchId:_.batchId,changes:Hm(p)}))}(s.localStore,e);s.sharedClientState.addPendingMutation(r.batchId),function(o,c,l){let u=o.Vu[o.currentUser.toKey()];u||(u=new Ie(J)),u=u.insert(c,l),o.Vu[o.currentUser.toKey()]=u}(s,r.batchId,t),await Ri(s,r.changes),await xa(s.remoteStore)}catch(r){const i=Su(r,"Failed to persist write");t.reject(i)}}async function Sg(n,e){const t=W(n);try{const s=await UR(t.localStore,e);e.targetChanges.forEach((r,i)=>{const o=t.Au.get(i);o&&(ne(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?o.hu=!0:r.modifiedDocuments.size>0?ne(o.hu,14607):r.removedDocuments.size>0&&(ne(o.hu,42227),o.hu=!1))}),await Ri(t,s,e)}catch(s){await rr(s)}}function sp(n,e,t){const s=W(n);if(s.isPrimaryClient&&t===0||!s.isPrimaryClient&&t===1){const r=[];s.Tu.forEach((i,o)=>{const c=o.view.va(e);c.snapshot&&r.push(c.snapshot)}),function(o,c){const l=W(o);l.onlineState=c;let u=!1;l.queries.forEach((d,p)=>{for(const _ of p.Sa)_.va(c)&&(u=!0)}),u&&ku(l)}(s.eventManager,e),r.length&&s.Pu.H_(r),s.onlineState=e,s.isPrimaryClient&&s.sharedClientState.setOnlineState(e)}}async function SS(n,e,t){const s=W(n);s.sharedClientState.updateQueryState(e,"rejected",t);const r=s.Au.get(e),i=r&&r.key;if(i){let o=new Ie(L.comparator);o=o.insert(i,Be.newNoDocument(i,H.min()));const c=Z().add(i),l=new Na(H.min(),new Map,new Ie(J),o,c);await Sg(s,l),s.du=s.du.remove(i),s.Au.delete(e),Ou(s)}else await wl(s.localStore,e,!1).then(()=>Cl(s,e,t)).catch(rr)}async function bS(n,e){const t=W(n),s=e.batch.batchId;try{const r=await FR(t.localStore,e);Pg(t,s,null),bg(t,s),t.sharedClientState.updateMutationState(s,"acknowledged"),await Ri(t,r)}catch(r){await rr(r)}}async function PS(n,e,t){const s=W(n);try{const r=await function(o,c){const l=W(o);return l.persistence.runTransaction("Reject batch","readwrite-primary",u=>{let d;return l.mutationQueue.lookupMutationBatch(u,c).next(p=>(ne(p!==null,37113),d=p.keys(),l.mutationQueue.removeMutationBatch(u,p))).next(()=>l.mutationQueue.performConsistencyCheck(u)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(u,d,c)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,d)).next(()=>l.localDocuments.getDocuments(u,d))})}(s.localStore,e);Pg(s,e,t),bg(s,e),s.sharedClientState.updateMutationState(e,"rejected",t),await Ri(s,r)}catch(r){await rr(r)}}function bg(n,e){(n.mu.get(e)||[]).forEach(t=>{t.resolve()}),n.mu.delete(e)}function Pg(n,e,t){const s=W(n);let r=s.Vu[s.currentUser.toKey()];if(r){const i=r.get(e);i&&(t?i.reject(t):i.resolve(),r=r.remove(e)),s.Vu[s.currentUser.toKey()]=r}}function Cl(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const s of n.Iu.get(e))n.Tu.delete(s),t&&n.Pu.yu(s,t);n.Iu.delete(e),n.isPrimaryClient&&n.Ru.jr(e).forEach(s=>{n.Ru.containsKey(s)||kg(n,s)})}function kg(n,e){n.Eu.delete(e.path.canonicalString());const t=n.du.get(e);t!==null&&(wu(n.remoteStore,t),n.du=n.du.remove(e),n.Au.delete(t),Ou(n))}function rp(n,e,t){for(const s of t)s instanceof Ag?(n.Ru.addReference(s.key,e),kS(n,s)):s instanceof Cg?(M(Du,"Document no longer in limbo: "+s.key),n.Ru.removeReference(s.key,e),n.Ru.containsKey(s.key)||kg(n,s.key)):q(19791,{wu:s})}function kS(n,e){const t=e.key,s=t.path.canonicalString();n.du.get(t)||n.Eu.has(s)||(M(Du,"New document in limbo: "+t),n.Eu.add(s),Ou(n))}function Ou(n){for(;n.Eu.size>0&&n.du.size<n.maxConcurrentLimboResolutions;){const e=n.Eu.values().next().value;n.Eu.delete(e);const t=new L(oe.fromString(e)),s=n.fu.next();n.Au.set(s,new ES(t)),n.du=n.du.insert(t,s),yg(n.remoteStore,new fn(xt(Ca(t.path)),s,"TargetPurposeLimboResolution",va.ce))}}async function Ri(n,e,t){const s=W(n),r=[],i=[],o=[];s.Tu.isEmpty()||(s.Tu.forEach((c,l)=>{o.push(s.pu(l,e,t).then(u=>{var d;if((u||t)&&s.isPrimaryClient){const p=u?!u.fromCache:(d=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:d.current;s.sharedClientState.updateQueryState(l.targetId,p?"current":"not-current")}if(u){r.push(u);const p=Tu.As(l.targetId,u);i.push(p)}}))}),await Promise.all(o),s.Pu.H_(r),await async function(l,u){const d=W(l);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>N.forEach(u,_=>N.forEach(_.Es,E=>d.persistence.referenceDelegate.addReference(p,_.targetId,E)).next(()=>N.forEach(_.ds,E=>d.persistence.referenceDelegate.removeReference(p,_.targetId,E)))))}catch(p){if(!ir(p))throw p;M(vu,"Failed to update sequence numbers: "+p)}for(const p of u){const _=p.targetId;if(!p.fromCache){const E=d.Ms.get(_),C=E.snapshotVersion,k=E.withLastLimboFreeSnapshotVersion(C);d.Ms=d.Ms.insert(_,k)}}}(s.localStore,i))}async function NS(n,e){const t=W(n);if(!t.currentUser.isEqual(e)){M(Du,"User change. New user:",e.toKey());const s=await pg(t.localStore,e);t.currentUser=e,function(i,o){i.mu.forEach(c=>{c.forEach(l=>{l.reject(new O(P.CANCELLED,o))})}),i.mu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,s.removedBatchIds,s.addedBatchIds),await Ri(t,s.Ls)}}function DS(n,e){const t=W(n),s=t.Au.get(e);if(s&&s.hu)return Z().add(s.key);{let r=Z();const i=t.Iu.get(e);if(!i)return r;for(const o of i){const c=t.Tu.get(o);r=r.unionWith(c.view.nu)}return r}}function Ng(n){const e=W(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Sg.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=DS.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=SS.bind(null,e),e.Pu.H_=_S.bind(null,e.eventManager),e.Pu.yu=mS.bind(null,e.eventManager),e}function OS(n){const e=W(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=bS.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=PS.bind(null,e),e}class jo{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Da(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return LR(this.persistence,new xR,e.initialUser,this.serializer)}Cu(e){return new fg(Eu.mi,this.serializer)}Du(e){return new WR}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}jo.provider={build:()=>new jo};class xS extends jo{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){ne(this.persistence.referenceDelegate instanceof qo,46915);const s=this.persistence.referenceDelegate.garbageCollector;return new ER(s,e.asyncQueue,t)}Cu(e){const t=this.cacheSizeBytes!==void 0?et.withCacheSize(this.cacheSizeBytes):et.DEFAULT;return new fg(s=>qo.mi(s,t),this.serializer)}}class Rl{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=s=>sp(this.syncEngine,s,1),this.remoteStore.remoteSyncer.handleCredentialChange=NS.bind(null,this.syncEngine),await dS(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new pS}()}createDatastore(e){const t=Da(e.databaseInfo.databaseId),s=function(i){return new QR(i)}(e.databaseInfo);return function(i,o,c,l){return new ZR(i,o,c,l)}(e.authCredentials,e.appCheckCredentials,s,t)}createRemoteStore(e){return function(s,r,i,o,c){return new tS(s,r,i,o,c)}(this.localStore,this.datastore,e.asyncQueue,t=>sp(this.syncEngine,t,0),function(){return Xf.v()?new Xf:new HR}())}createSyncEngine(e,t){return function(r,i,o,c,l,u,d){const p=new TS(r,i,o,c,l,u);return d&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(r){const i=W(r);M(ns,"RemoteStore shutting down."),i.Ea.add(5),await Ci(i),i.Aa.shutdown(),i.Ra.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Rl.provider={build:()=>new Rl};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xu{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):Qt("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kn="FirestoreClient";class MS{constructor(e,t,s,r,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=s,this.databaseInfo=r,this.user=Ue.UNAUTHENTICATED,this.clientId=Ea.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(s,async o=>{M(kn,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(s,o=>(M(kn,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ot;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const s=Su(t,"Failed to shutdown persistence");e.reject(s)}}),e.promise}}async function $c(n,e){n.asyncQueue.verifyOperationInProgress(),M(kn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let s=t.initialUser;n.setCredentialChangeListener(async r=>{s.isEqual(r)||(await pg(e.localStore,r),s=r)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function ip(n,e){n.asyncQueue.verifyOperationInProgress();const t=await VS(n);M(kn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(s=>Zf(e.remoteStore,s)),n.setAppCheckTokenChangeListener((s,r)=>Zf(e.remoteStore,r)),n._onlineComponents=e}async function VS(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){M(kn,"Using user provided OfflineComponentProvider");try{await $c(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(r){return r.name==="FirebaseError"?r.code===P.FAILED_PRECONDITION||r.code===P.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(t))throw t;ts("Error using user provided cache. Falling back to memory cache: "+t),await $c(n,new jo)}}else M(kn,"Using default OfflineComponentProvider"),await $c(n,new xS(void 0));return n._offlineComponents}async function Mu(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(M(kn,"Using user provided OnlineComponentProvider"),await ip(n,n._uninitializedComponentsProvider._online)):(M(kn,"Using default OnlineComponentProvider"),await ip(n,new Rl))),n._onlineComponents}function LS(n){return Mu(n).then(e=>e.syncEngine)}function FS(n){return Mu(n).then(e=>e.datastore)}async function Wo(n){const e=await Mu(n),t=e.eventManager;return t.onListen=vS.bind(null,e.syncEngine),t.onUnlisten=AS.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=wS.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=CS.bind(null,e.syncEngine),t}function Dg(n,e,t={}){const s=new Ot;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,c,l,u){const d=new xu({next:_=>{d.Nu(),o.enqueueAndForget(()=>Pu(i,p));const E=_.docs.has(c);!E&&_.fromCache?u.reject(new O(P.UNAVAILABLE,"Failed to get document because the client is offline.")):E&&_.fromCache&&l&&l.source==="server"?u.reject(new O(P.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(_)},error:_=>u.reject(_)}),p=new Nu(Ca(c.path),d,{includeMetadataChanges:!0,qa:!0});return bu(i,p)}(await Wo(n),n.asyncQueue,e,t,s)),s.promise}function US(n,e,t={}){const s=new Ot;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,c,l,u){const d=new xu({next:_=>{d.Nu(),o.enqueueAndForget(()=>Pu(i,p)),_.fromCache&&l.source==="server"?u.reject(new O(P.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(_)},error:_=>u.reject(_)}),p=new Nu(c,d,{includeMetadataChanges:!0,qa:!0});return bu(i,p)}(await Wo(n),n.asyncQueue,e,t,s)),s.promise}function BS(n,e,t){const s=new Ot;return n.asyncQueue.enqueueAndForget(async()=>{try{const r=await FS(n);s.resolve(async function(o,c,l){var k;const u=W(o),{request:d,gt:p,parent:_}=oR(u.serializer,SC(c),l);u.connection.$o||delete d.parent;const E=(await u.Ho("RunAggregationQuery",u.serializer.databaseId,_,d,1)).filter(b=>!!b.result);ne(E.length===1,64727);const C=(k=E[0].result)==null?void 0:k.aggregateFields;return Object.keys(C).reduce((b,V)=>(b[p[V]]=C[V],b),{})}(r,e,t))}catch(r){s.reject(r)}}),s.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Og(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const op=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xg="firestore.googleapis.com",ap=!0;class cp{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new O(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=xg,this.ssl=ap}else this.host=e.host,this.ssl=e.ssl??ap;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=dg;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<gR)throw new O(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Im("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Og(e.experimentalLongPollingOptions??{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(s,r){return s.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ma{constructor(e,t,s,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=s,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new cp({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new O(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new cp(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(s){if(!s)return new vm;switch(s.type){case"firstParty":return new KA(s.sessionIndex||"0",s.iamToken||null,s.authTokenFactory||null);case"provider":return s.client;default:throw new O(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const s=op.get(t);s&&(M("ComponentProvider","Removing Datastore"),op.delete(t),s.terminate())}(this),Promise.resolve()}}function Mg(n,e,t,s={}){var u;n=Se(n,Ma);const r=ft(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;r&&(mi(`https://${c}`),gi("Firestore",!0)),i.host!==xg&&i.host!==c&&ts("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...i,host:c,ssl:r,emulatorOptions:s};if(!zt(l,o)&&(n._setSettings(l),s.mockUserToken)){let d,p;if(typeof s.mockUserToken=="string")d=s.mockUserToken,p=Ue.MOCK_USER;else{d=Wl(s.mockUserToken,(u=n._app)==null?void 0:u.options.projectId);const _=s.mockUserToken.sub||s.mockUserToken.user_id;if(!_)throw new O(P.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Ue(_)}n._authCredentials=new HA(new Tm(d,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e,t,s){this.converter=t,this._query=s,this.type="query",this.firestore=e}withConverter(e){return new Rt(this.firestore,e,this._query)}}class de{constructor(e,t,s){this.converter=t,this._key=s,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Wt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new de(this.firestore,e,this._key)}toJSON(){return{type:de._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,s){if(wi(t,de._jsonSchema))return new de(e,s||null,new L(oe.fromString(t.referencePath)))}}de._jsonSchemaVersion="firestore/documentReference/1.0",de._jsonSchema={type:we("string",de._jsonSchemaVersion),referencePath:we("string")};class Wt extends Rt{constructor(e,t,s){super(e,t,Ca(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new de(this.firestore,null,new L(e))}withConverter(e){return new Wt(this.firestore,e,this._path)}}function qS(n,e,...t){if(n=j(n),wm("collection","path",e),n instanceof Ma){const s=oe.fromString(e,...t);return wf(s),new Wt(n,null,s)}{if(!(n instanceof de||n instanceof Wt))throw new O(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=n._path.child(oe.fromString(e,...t));return wf(s),new Wt(n.firestore,null,s)}}function Vg(n,e,...t){if(n=j(n),arguments.length===1&&(e=Ea.newId()),wm("doc","path",e),n instanceof Ma){const s=oe.fromString(e,...t);return vf(s),new de(n,null,new L(s))}{if(!(n instanceof de||n instanceof Wt))throw new O(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=n._path.child(oe.fromString(e,...t));return vf(s),new de(n.firestore,n instanceof Wt?n.converter:null,new L(s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lp="AsyncQueue";class up{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new mg(this,"async_queue_retry"),this._c=()=>{const s=qc();s&&M(lp,"Visibility state changed to "+s.visibilityState),this.M_.w_()},this.ac=e;const t=qc();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=qc();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const t=new Ot;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Xu.push(e),this.lc()))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!ir(e))throw e;M(lp,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const t=this.ac.then(()=>(this.rc=!0,e().catch(s=>{throw this.nc=s,this.rc=!1,Qt("INTERNAL UNHANDLED ERROR: ",hp(s)),s}).then(s=>(this.rc=!1,s))));return this.ac=t,t}enqueueAfterDelay(e,t,s){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const r=Ru.createAndSchedule(this,e,t,s,i=>this.hc(i));return this.tc.push(r),r}uc(){this.nc&&q(47125,{Pc:hp(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((t,s)=>t.targetTimeMs-s.targetTimeMs);for(const t of this.tc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Tc()})}dc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function hp(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dp(n){return function(t,s){if(typeof t!="object"||t===null)return!1;const r=t;for(const i of s)if(i in r&&typeof r[i]=="function")return!0;return!1}(n,["next","error","complete"])}class ct extends Ma{constructor(e,t,s,r){super(e,t,s,r),this.type="firestore",this._queue=new up,this._persistenceKey=(r==null?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new up(e),this._firestoreClient=void 0,await e}}}function $S(n,e){const t=typeof n=="object"?n:er(),s=typeof n=="string"?n:Vo,r=Mn(t,"firestore").getImmediate({identifier:s});if(!r._initialized){const i=da("firestore");i&&Mg(r,...i)}return r}function Un(n){if(n._terminated)throw new O(P.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||jS(n),n._firestoreClient}function jS(n){var s,r,i;const e=n._freezeSettings(),t=function(c,l,u,d){return new dC(c,l,u,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,Og(d.experimentalLongPollingOptions),d.useFetchStreams,d.isUsingEmulator)}(n._databaseId,((s=n._app)==null?void 0:s.options.appId)||"",n._persistenceKey,e);n._componentsProvider||(r=e.localCache)!=null&&r._offlineComponentProvider&&((i=e.localCache)!=null&&i._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new MS(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(c){const l=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(l),_online:l}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lg{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class Fg{constructor(e,t,s){this._userDataWriter=t,this._data=s,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ot(Me.fromBase64String(e))}catch(t){throw new O(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new ot(Me.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:ot._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(wi(e,ot._jsonSchema))return ot.fromBase64String(e.bytes)}}ot._jsonSchemaVersion="firestore/bytes/1.0",ot._jsonSchema={type:we("string",ot._jsonSchemaVersion),bytes:we("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new O(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new xe(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Et._jsonSchemaVersion}}static fromJSON(e){if(wi(e,Et._jsonSchema))return new Et(e.latitude,e.longitude)}}Et._jsonSchemaVersion="firestore/geoPoint/1.0",Et._jsonSchema={type:we("string",Et._jsonSchemaVersion),latitude:we("number"),longitude:we("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tt{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(s,r){if(s.length!==r.length)return!1;for(let i=0;i<s.length;++i)if(s[i]!==r[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Tt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(wi(e,Tt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new Tt(e.vectorValues);throw new O(P.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Tt._jsonSchemaVersion="firestore/vectorValue/1.0",Tt._jsonSchema={type:we("string",Tt._jsonSchemaVersion),vectorValues:we("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WS=/^__.*__$/;class HS{constructor(e,t,s){this.data=e,this.fieldMask=t,this.fieldTransforms=s}toMutation(e,t){return this.fieldMask!==null?new Fn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Ii(e,this.data,t,this.fieldTransforms)}}class Ug{constructor(e,t,s){this.data=e,this.fieldMask=t,this.fieldTransforms=s}toMutation(e,t){return new Fn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Bg(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw q(40011,{Ac:n})}}class Va{constructor(e,t,s,r,i,o){this.settings=e,this.databaseId=t,this.serializer=s,this.ignoreUndefinedProperties=r,i===void 0&&this.Rc(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(e){return new Va({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(e){var r;const t=(r=this.path)==null?void 0:r.child(e),s=this.Vc({path:t,fc:!1});return s.gc(e),s}yc(e){var r;const t=(r=this.path)==null?void 0:r.child(e),s=this.Vc({path:t,fc:!1});return s.Rc(),s}wc(e){return this.Vc({path:void 0,fc:!0})}Sc(e){return Ho(e,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Rc(){if(this.path)for(let e=0;e<this.path.length;e++)this.gc(this.path.get(e))}gc(e){if(e.length===0)throw this.Sc("Document fields must not be empty");if(Bg(this.Ac)&&WS.test(e))throw this.Sc('Document fields cannot begin and end with "__"')}}class zS{constructor(e,t,s){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=s||Da(e)}Cc(e,t,s,r=!1){return new Va({Ac:e,methodName:t,Dc:s,path:xe.emptyPath(),fc:!1,bc:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function cr(n){const e=n._freezeSettings(),t=Da(n._databaseId);return new zS(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Vu(n,e,t,s,r,i={}){const o=n.Cc(i.merge||i.mergeFields?2:0,e,t,r);Bu("Data must be an object, but it was:",o,s);const c=Wg(s,o);let l,u;if(i.merge)l=new at(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const d=[];for(const p of i.mergeFields){const _=Sl(e,p,t);if(!o.contains(_))throw new O(P.INVALID_ARGUMENT,`Field '${_}' is specified in your field mask but missing from your input data.`);zg(d,_)||d.push(_)}l=new at(d),u=o.fieldTransforms.filter(p=>l.covers(p.field))}else l=null,u=o.fieldTransforms;return new HS(new tt(c),l,u)}class Si extends hs{_toFieldTransform(e){if(e.Ac!==2)throw e.Ac===1?e.Sc(`${this._methodName}() can only appear at the top level of your update data`):e.Sc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Si}}function GS(n,e,t){return new Va({Ac:3,Dc:e.settings.Dc,methodName:n._methodName,fc:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class Lu extends hs{_toFieldTransform(e){return new pu(e.path,new oi)}isEqual(e){return e instanceof Lu}}class Fu extends hs{constructor(e,t){super(e),this.vc=t}_toFieldTransform(e){const t=GS(this,e,!0),s=this.vc.map(i=>lr(i,t)),r=new qs(s);return new pu(e.path,r)}isEqual(e){return e instanceof Fu&&zt(this.vc,e.vc)}}class Uu extends hs{constructor(e,t){super(e),this.Fc=t}_toFieldTransform(e){const t=new ci(e.serializer,Km(e.serializer,this.Fc));return new pu(e.path,t)}isEqual(e){return e instanceof Uu&&this.Fc===e.Fc}}function qg(n,e,t,s){const r=n.Cc(1,e,t);Bu("Data must be an object, but it was:",r,s);const i=[],o=tt.empty();Ln(s,(l,u)=>{const d=qu(e,l,t);u=j(u);const p=r.yc(d);if(u instanceof Si)i.push(d);else{const _=lr(u,p);_!=null&&(i.push(d),o.set(d,_))}});const c=new at(i);return new Ug(o,c,r.fieldTransforms)}function $g(n,e,t,s,r,i){const o=n.Cc(1,e,t),c=[Sl(e,s,t)],l=[r];if(i.length%2!=0)throw new O(P.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let _=0;_<i.length;_+=2)c.push(Sl(e,i[_])),l.push(i[_+1]);const u=[],d=tt.empty();for(let _=c.length-1;_>=0;--_)if(!zg(u,c[_])){const E=c[_];let C=l[_];C=j(C);const k=o.yc(E);if(C instanceof Si)u.push(E);else{const b=lr(C,k);b!=null&&(u.push(E),d.set(E,b))}}const p=new at(u);return new Ug(d,p,o.fieldTransforms)}function jg(n,e,t,s=!1){return lr(t,n.Cc(s?4:3,e))}function lr(n,e){if(Hg(n=j(n)))return Bu("Unsupported field value:",e,n),Wg(n,e);if(n instanceof hs)return function(s,r){if(!Bg(r.Ac))throw r.Sc(`${s._methodName}() can only be used with update() and set()`);if(!r.path)throw r.Sc(`${s._methodName}() is not currently supported inside arrays`);const i=s._toFieldTransform(r);i&&r.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.fc&&e.Ac!==4)throw e.Sc("Nested arrays are not supported");return function(s,r){const i=[];let o=0;for(const c of s){let l=lr(c,r.wc(o));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),o++}return{arrayValue:{values:i}}}(n,e)}return function(s,r){if((s=j(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Km(r.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const i=le.fromDate(s);return{timestampValue:Bo(r.serializer,i)}}if(s instanceof le){const i=new le(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Bo(r.serializer,i)}}if(s instanceof Et)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof ot)return{bytesValue:rg(r.serializer,s._byteString)};if(s instanceof de){const i=r.databaseId,o=s.firestore._databaseId;if(!o.isEqual(i))throw r.Sc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:gu(s.firestore._databaseId||r.databaseId,s._key.path)}}if(s instanceof Tt)return function(o,c){return{mapValue:{fields:{[Dm]:{stringValue:Om},[Lo]:{arrayValue:{values:o.toArray().map(u=>{if(typeof u!="number")throw c.Sc("VectorValues must only contain numeric values.");return fu(c.serializer,u)})}}}}}}(s,r);throw r.Sc(`Unsupported field value: ${Ta(s)}`)}(n,e)}function Wg(n,e){const t={};return Rm(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Ln(n,(s,r)=>{const i=lr(r,e.mc(s));i!=null&&(t[s]=i)}),{mapValue:{fields:t}}}function Hg(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof le||n instanceof Et||n instanceof ot||n instanceof de||n instanceof hs||n instanceof Tt)}function Bu(n,e,t){if(!Hg(t)||!Am(t)){const s=Ta(t);throw s==="an object"?e.Sc(n+" a custom object"):e.Sc(n+" "+s)}}function Sl(n,e,t){if((e=j(e))instanceof ar)return e._internalPath;if(typeof e=="string")return qu(n,e);throw Ho("Field path arguments must be of type string or ",n,!1,void 0,t)}const KS=new RegExp("[~\\*/\\[\\]]");function qu(n,e,t){if(e.search(KS)>=0)throw Ho(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new ar(...e.split("."))._internalPath}catch{throw Ho(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Ho(n,e,t,s,r){const i=s&&!s.isEmpty(),o=r!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(i||o)&&(l+=" (found",i&&(l+=` in field ${s}`),o&&(l+=` in document ${r}`),l+=")"),new O(P.INVALID_ARGUMENT,c+n+l)}function zg(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $u{constructor(e,t,s,r,i){this._firestore=e,this._userDataWriter=t,this._key=s,this._document=r,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new de(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new QS(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(La("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class QS extends $u{data(){return super.data()}}function La(n,e){return typeof e=="string"?qu(n,e):e instanceof ar?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gg(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new O(P.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class ju{}class bi extends ju{}function YS(n,e,...t){let s=[];e instanceof ju&&s.push(e),s=s.concat(t),function(i){const o=i.filter(l=>l instanceof Fa).length,c=i.filter(l=>l instanceof Pi).length;if(o>1||o>0&&c>0)throw new O(P.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(s);for(const r of s)n=r._apply(n);return n}class Pi extends bi{constructor(e,t,s){super(),this._field=e,this._op=t,this._value=s,this.type="where"}static _create(e,t,s){return new Pi(e,t,s)}_apply(e){const t=this._parse(e);return Kg(e._query,t),new Rt(e.firestore,e.converter,gl(e._query,t))}_parse(e){const t=cr(e.firestore);return function(i,o,c,l,u,d,p){let _;if(u.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new O(P.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){pp(p,d);const C=[];for(const k of p)C.push(fp(l,i,k));_={arrayValue:{values:C}}}else _=fp(l,i,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||pp(p,d),_=jg(c,o,p,d==="in"||d==="not-in");return ve.create(u,d,_)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function XS(n,e,t){const s=e,r=La("where",n);return Pi._create(r,s,t)}class Fa extends ju{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Fa(e,t)}_parse(e){const t=this._queryConstraints.map(s=>s._parse(e)).filter(s=>s.getFilters().length>0);return t.length===1?t[0]:It.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(r,i){let o=r;const c=i.getFlattenedFilters();for(const l of c)Kg(o,l),o=gl(o,l)}(e._query,t),new Rt(e.firestore,e.converter,gl(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Ua extends bi{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Ua(e,t)}_apply(e){const t=function(r,i,o){if(r.startAt!==null)throw new O(P.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new O(P.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ii(i,o)}(e._query,this._field,this._direction);return new Rt(e.firestore,e.converter,function(r,i){const o=r.explicitOrderBy.concat([i]);return new cs(r.path,r.collectionGroup,o,r.filters.slice(),r.limit,r.limitType,r.startAt,r.endAt)}(e._query,t))}}function JS(n,e="asc"){const t=e,s=La("orderBy",n);return Ua._create(s,t)}class Ba extends bi{constructor(e,t,s){super(),this.type=e,this._limit=t,this._limitType=s}static _create(e,t,s){return new Ba(e,t,s)}_apply(e){return new Rt(e.firestore,e.converter,Uo(e._query,this._limit,this._limitType))}}function ZS(n){return eC("limit",n),Ba._create("limit",n,"F")}class qa extends bi{constructor(e,t,s){super(),this.type=e,this._docOrFields=t,this._inclusive=s}static _create(e,t,s){return new qa(e,t,s)}_apply(e){const t=tb(e,this.type,this._docOrFields,this._inclusive);return new Rt(e.firestore,e.converter,function(r,i){return new cs(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),r.limit,r.limitType,i,r.endAt)}(e._query,t))}}function eb(...n){return qa._create("startAfter",n,!1)}function tb(n,e,t,s){if(t[0]=j(t[0]),t[0]instanceof $u)return function(i,o,c,l,u){if(!l)throw new O(P.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${c}().`);const d=[];for(const p of ks(i))if(p.field.isKeyField())d.push(Fo(o,l.key));else{const _=l.data.field(p.field);if(Ia(_))throw new O(P.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+p.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(_===null){const E=p.field.canonicalString();throw new O(P.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${E}' (used as the orderBy) does not exist.`)}d.push(_)}return new Bs(d,u)}(n._query,n.firestore._databaseId,e,t[0]._document,s);{const r=cr(n.firestore);return function(o,c,l,u,d,p){const _=o.explicitOrderBy;if(d.length>_.length)throw new O(P.INVALID_ARGUMENT,`Too many arguments provided to ${u}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const E=[];for(let C=0;C<d.length;C++){const k=d[C];if(_[C].field.isKeyField()){if(typeof k!="string")throw new O(P.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${u}(), but got a ${typeof k}`);if(!du(o)&&k.indexOf("/")!==-1)throw new O(P.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${u}() must be a plain document ID, but '${k}' contains a slash.`);const b=o.path.child(oe.fromString(k));if(!L.isDocumentKey(b))throw new O(P.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${u}() must result in a valid document path, but '${b}' is not because it contains an odd number of segments.`);const V=new L(b);E.push(Fo(c,V))}else{const b=jg(l,u,k);E.push(b)}}return new Bs(E,p)}(n._query,n.firestore._databaseId,r,e,t,s)}}function fp(n,e,t){if(typeof(t=j(t))=="string"){if(t==="")throw new O(P.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!du(e)&&t.indexOf("/")!==-1)throw new O(P.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const s=e.path.child(oe.fromString(t));if(!L.isDocumentKey(s))throw new O(P.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${s}' is not because it has an odd number of segments (${s.length}).`);return Fo(n,new L(s))}if(t instanceof de)return Fo(n,t._key);throw new O(P.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Ta(t)}.`)}function pp(n,e){if(!Array.isArray(n)||n.length===0)throw new O(P.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Kg(n,e){const t=function(r,i){for(const o of r)for(const c of o.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new O(P.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new O(P.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class Qg{convertValue(e,t="none"){switch(bn(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ye(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Sn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw q(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const s={};return Ln(e,(r,i)=>{s[r]=this.convertValue(i,t)}),s}convertVectorValue(e){var s,r,i;const t=(i=(r=(s=e.fields)==null?void 0:s[Lo].arrayValue)==null?void 0:r.values)==null?void 0:i.map(o=>ye(o.doubleValue));return new Tt(t)}convertGeoPoint(e){return new Et(ye(e.latitude),ye(e.longitude))}convertArray(e,t){return(e.values||[]).map(s=>this.convertValue(s,t))}convertServerTimestamp(e,t){switch(t){case"previous":const s=Aa(e);return s==null?null:this.convertValue(s,t);case"estimate":return this.convertTimestamp(si(e));default:return null}}convertTimestamp(e){const t=Rn(e);return new le(t.seconds,t.nanos)}convertDocumentKey(e,t){const s=oe.fromString(e);ne(hg(s),9688,{name:e});const r=new Ls(s.get(1),s.get(3)),i=new L(s.popFirst(5));return r.isEqual(t)||Qt(`Document ${i} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wu(n,e,t){let s;return s=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,s}function Yg(){return new Lg("count")}class As{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class vn extends $u{constructor(e,t,s,r,i,o){super(e,t,s,r,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Hr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const s=this._document.data.field(La("DocumentSnapshot.get",e));if(s!==null)return this._userDataWriter.convertValue(s,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new O(P.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=vn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}vn._jsonSchemaVersion="firestore/documentSnapshot/1.0",vn._jsonSchema={type:we("string",vn._jsonSchemaVersion),bundleSource:we("string","DocumentSnapshot"),bundleName:we("string"),bundle:we("string")};class Hr extends vn{data(e={}){return super.data(e)}}class wn{constructor(e,t,s,r){this._firestore=e,this._userDataWriter=t,this._snapshot=r,this.metadata=new As(r.hasPendingWrites,r.fromCache),this.query=s}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(s=>{e.call(t,new Hr(this._firestore,this._userDataWriter,s.key,s,new As(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new O(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(r,i){if(r._snapshot.oldDocs.isEmpty()){let o=0;return r._snapshot.docChanges.map(c=>{const l=new Hr(r._firestore,r._userDataWriter,c.doc.key,c.doc,new As(r._snapshot.mutatedKeys.has(c.doc.key),r._snapshot.fromCache),r.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:o++}})}{let o=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const l=new Hr(r._firestore,r._userDataWriter,c.doc.key,c.doc,new As(r._snapshot.mutatedKeys.has(c.doc.key),r._snapshot.fromCache),r.query.converter);let u=-1,d=-1;return c.type!==0&&(u=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),d=o.indexOf(c.doc.key)),{type:nb(c.type),doc:l,oldIndex:u,newIndex:d}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new O(P.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=wn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ea.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],s=[],r=[];return this.docs.forEach(i=>{i._document!==null&&(t.push(i._document),s.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),r.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function nb(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return q(61501,{type:n})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sb(n){if(window.__gvdmOfflineFallback)return window.__gvdmOfflineFallback.getDoc(n);n=Se(n,de);const e=Se(n.firestore,ct);return Dg(Un(e),n._key).then(t=>Hu(e,n,t)).catch(err=>(window.__gvdmOfflineFallback?window.__gvdmOfflineFallback.getDoc(n):Promise.reject(err)))}wn._jsonSchemaVersion="firestore/querySnapshot/1.0",wn._jsonSchema={type:we("string",wn._jsonSchemaVersion),bundleSource:we("string","QuerySnapshot"),bundleName:we("string"),bundle:we("string")};class $a extends Qg{constructor(e){super(),this.firestore=e}convertBytes(e){return new ot(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new de(this.firestore,null,t)}}function rb(n){if(window.__gvdmOfflineFallback)return window.__gvdmOfflineFallback.getDoc(n);n=Se(n,de);const e=Se(n.firestore,ct);return Dg(Un(e),n._key,{source:"server"}).then(t=>Hu(e,n,t))}function ib(n){if(window.__gvdmOfflineFallback)return window.__gvdmOfflineFallback.getDocs(n);n=Se(n,Rt);const e=Se(n.firestore,ct),t=Un(e),s=new $a(e);return Gg(n._query),US(t,n._query).then(r=>new wn(e,s,n,r)).catch(err=>(window.__gvdmOfflineFallback?window.__gvdmOfflineFallback.getDocs(n):Promise.reject(err)))}function ob(n,e,t){if(window.__gvdmOfflineFallback)return window.__gvdmOfflineFallback.setDoc(n,e,t);n=Se(n,de);const s=Se(n.firestore,ct),r=Wu(n.converter,e,t);return ur(s,[Vu(cr(s),"setDoc",n._key,r,n.converter!==null,t).toMutation(n._key,Xe.none())])}function ab(n,e,t,...s){if(window.__gvdmOfflineFallback)return window.__gvdmOfflineFallback.updateDoc(n,e);n=Se(n,de);const r=Se(n.firestore,ct),i=cr(r);let o;return o=typeof(e=j(e))=="string"||e instanceof ar?$g(i,"updateDoc",n._key,e,t,s):qg(i,"updateDoc",n._key,e),ur(r,[o.toMutation(n._key,Xe.exists(!0))])}function cb(n){if(window.__gvdmOfflineFallback)return window.__gvdmOfflineFallback.deleteDoc(n);return ur(Se(n.firestore,ct),[new ka(n._key,Xe.none())])}function lb(n,e){if(window.__gvdmOfflineFallback)return window.__gvdmOfflineFallback.addDoc(n,e);const t=Se(n.firestore,ct),s=Vg(n),r=Wu(n.converter,e);return ur(t,[Vu(cr(n.firestore),"addDoc",s._key,r,n.converter!==null,{}).toMutation(s._key,Xe.exists(!1))]).then(()=>s)}function ub(n,...e){if(window.__gvdmOfflineFallback&&window.__gvdmOfflineFallback.onSnapshot)return window.__gvdmOfflineFallback.onSnapshot(n,...e);var l,u,d;n=j(n);let t={includeMetadataChanges:!1,source:"default"},s=0;typeof e[s]!="object"||dp(e[s])||(t=e[s++]);const r={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(dp(e[s])){const p=e[s];e[s]=(l=p.next)==null?void 0:l.bind(p),e[s+1]=(u=p.error)==null?void 0:u.bind(p),e[s+2]=(d=p.complete)==null?void 0:d.bind(p)}let i,o,c;if(n instanceof de)o=Se(n.firestore,ct),c=Ca(n._key.path),i={next:p=>{e[s]&&e[s](Hu(o,n,p))},error:e[s+1],complete:e[s+2]};else{const p=Se(n,Rt);o=Se(p.firestore,ct),c=p._query;const _=new $a(o);i={next:E=>{e[s]&&e[s](new wn(o,_,p,E))},error:e[s+1],complete:e[s+2]},Gg(n._query)}return function(_,E,C,k){const b=new xu(k),V=new Nu(E,b,C);return _.asyncQueue.enqueueAndForget(async()=>bu(await Wo(_),V)),()=>{b.Nu(),_.asyncQueue.enqueueAndForget(async()=>Pu(await Wo(_),V))}}(Un(o),c,r,i)}function ur(n,e){return function(s,r){const i=new Ot;return s.asyncQueue.enqueueAndForget(async()=>RS(await LS(s),r,i)),i.promise}(Un(n),e)}function Hu(n,e,t){const s=t.docs.get(e._key),r=new $a(n);return new vn(n,r,e._key,s,new As(t.hasPendingWrites,t.fromCache),e.converter)}function hb(n){if(window.__gvdmOfflineFallback)return Promise.resolve({data:()=>({count:0})});return Xg(n,{count:Yg()})}function Xg(n,e){const t=Se(n.firestore,ct),s=Un(t),r=uC(e,(i,o)=>new WC(o,i.aggregateType,i._internalFieldPath));return BS(s,n._query,r).then(i=>function(c,l,u){const d=new $a(c);return new Fg(l,d,u)}(t,n,i))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jg{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=cr(e)}set(e,t,s){this._verifyNotCommitted();const r=jc(e,this._firestore),i=Wu(r.converter,t,s),o=Vu(this._dataReader,"WriteBatch.set",r._key,i,r.converter!==null,s);return this._mutations.push(o.toMutation(r._key,Xe.none())),this}update(e,t,s,...r){this._verifyNotCommitted();const i=jc(e,this._firestore);let o;return o=typeof(t=j(t))=="string"||t instanceof ar?$g(this._dataReader,"WriteBatch.update",i._key,t,s,r):qg(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,Xe.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=jc(e,this._firestore);return this._mutations=this._mutations.concat(new ka(t._key,Xe.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new O(P.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function jc(n,e){if((n=j(n)).firestore!==e)throw new O(P.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function db(){return new Si("deleteField")}function fb(){return new Lu("serverTimestamp")}function pb(...n){return new Fu("arrayUnion",n)}function _b(n){return new Uu("increment",n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mb(n){return Un(n=Se(n,ct)),new Jg(n,e=>ur(n,e))}(function(e,t=!0){(function(r){sr=r})(Vn),wt(new dt("firestore",(s,{instanceIdentifier:r,options:i})=>{const o=s.getProvider("app").getImmediate(),c=new ct(new zA(s.getProvider("auth-internal")),new QA(o,s.getProvider("app-check-internal")),function(u,d){if(!Object.prototype.hasOwnProperty.apply(u.options,["projectId"]))throw new O(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ls(u.options.projectId,d)}(o,r),o);return i={useFetchStreams:t,...i},c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),Ye(gf,yf,e),Ye(gf,yf,"esm2020")})();const $D=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:Qg,AggregateField:Lg,AggregateQuerySnapshot:Fg,Bytes:ot,CollectionReference:Wt,DocumentReference:de,DocumentSnapshot:vn,FieldPath:ar,FieldValue:hs,Firestore:ct,FirestoreError:O,GeoPoint:Et,Query:Rt,QueryCompositeFilterConstraint:Fa,QueryConstraint:bi,QueryDocumentSnapshot:Hr,QueryFieldFilterConstraint:Pi,QueryLimitConstraint:Ba,QueryOrderByConstraint:Ua,QuerySnapshot:wn,QueryStartAtConstraint:qa,SnapshotMetadata:As,Timestamp:le,VectorValue:Tt,WriteBatch:Jg,_AutoId:Ea,_ByteString:Me,_DatabaseId:Ls,_DocumentKey:L,_EmptyAuthCredentialsProvider:vm,_FieldPath:xe,_cast:Se,_logWarn:ts,_validateIsNotUsedTogether:Im,addDoc:lb,arrayUnion:pb,collection:qS,connectFirestoreEmulator:Mg,count:Yg,deleteDoc:cb,deleteField:db,doc:Vg,ensureFirestoreConfigured:Un,executeWrite:ur,getAggregateFromServer:Xg,getCountFromServer:hb,getDoc:sb,getDocFromServer:rb,getDocs:ib,getFirestore:$S,increment:_b,limit:ZS,onSnapshot:ub,orderBy:JS,query:YS,serverTimestamp:fb,setDoc:ob,startAfter:eb,updateDoc:ab,where:XS,writeBatch:mb},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zg="firebasestorage.googleapis.com",ey="storageBucket",gb=2*60*1e3,yb=10*60*1e3,Eb=1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pe extends At{constructor(e,t,s=0){super(Wc(e),`Firebase Storage: ${t} (${Wc(e)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,pe.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Wc(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var ue;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(ue||(ue={}));function Wc(n){return"storage/"+n}function zu(){const n="An unknown error occurred, please check the error payload for server response.";return new pe(ue.UNKNOWN,n)}function Tb(n){return new pe(ue.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function vb(n){return new pe(ue.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function wb(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new pe(ue.UNAUTHENTICATED,n)}function Ib(){return new pe(ue.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function Ab(n){return new pe(ue.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function ty(){return new pe(ue.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function ny(){return new pe(ue.CANCELED,"User canceled the upload/download.")}function Cb(n){return new pe(ue.INVALID_URL,"Invalid URL '"+n+"'.")}function Rb(n){return new pe(ue.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function Sb(){return new pe(ue.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+ey+"' property when initializing the app?")}function sy(){return new pe(ue.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function bb(){return new pe(ue.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function Pb(){return new pe(ue.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function kb(n){return new pe(ue.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function zo(n){return new pe(ue.INVALID_ARGUMENT,n)}function ry(){return new pe(ue.APP_DELETED,"The Firebase app was deleted.")}function iy(n){return new pe(ue.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function zr(n,e){return new pe(ue.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function Dr(n){throw new pe(ue.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let s;try{s=qe.makeFromUrl(e,t)}catch{return new qe(e,"")}if(s.path==="")return s;throw Rb(e)}static makeFromUrl(e,t){let s=null;const r="([A-Za-z0-9.\\-_]+)";function i(K){K.path.charAt(K.path.length-1)==="/"&&(K.path_=K.path_.slice(0,-1))}const o="(/(.*))?$",c=new RegExp("^gs://"+r+o,"i"),l={bucket:1,path:3};function u(K){K.path_=decodeURIComponent(K.path)}const d="v[A-Za-z0-9_]+",p=t.replace(/[.]/g,"\\."),_="(/([^?#]*).*)?$",E=new RegExp(`^https?://${p}/${d}/b/${r}/o${_}`,"i"),C={bucket:1,path:3},k=t===Zg?"(?:storage.googleapis.com|storage.cloud.google.com)":t,b="([^?#]*)",V=new RegExp(`^https?://${k}/${r}/${b}`,"i"),U=[{regex:c,indices:l,postModify:i},{regex:E,indices:C,postModify:u},{regex:V,indices:{bucket:1,path:2},postModify:u}];for(let K=0;K<U.length;K++){const Ee=U[K],ae=Ee.regex.exec(e);if(ae){const w=ae[Ee.indices.bucket];let g=ae[Ee.indices.path];g||(g=""),s=new qe(w,g),Ee.postModify(s);break}}if(s==null)throw Cb(e);return s}}class Nb{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Db(n,e,t){let s=1,r=null,i=null,o=!1,c=0;function l(){return c===2}let u=!1;function d(...b){u||(u=!0,e.apply(null,b))}function p(b){r=setTimeout(()=>{r=null,n(E,l())},b)}function _(){i&&clearTimeout(i)}function E(b,...V){if(u){_();return}if(b){_(),d.call(null,b,...V);return}if(l()||o){_(),d.call(null,b,...V);return}s<64&&(s*=2);let U;c===1?(c=2,U=0):U=(s+Math.random())*1e3,p(U)}let C=!1;function k(b){C||(C=!0,_(),!u&&(r!==null?(b||(c=2),clearTimeout(r),p(0)):b||(c=1)))}return p(0),i=setTimeout(()=>{o=!0,k(!0)},t),k}function Ob(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xb(n){return n!==void 0}function Mb(n){return typeof n=="function"}function Vb(n){return typeof n=="object"&&!Array.isArray(n)}function ja(n){return typeof n=="string"||n instanceof String}function _p(n){return Gu()&&n instanceof Blob}function Gu(){return typeof Blob<"u"}function bl(n,e,t,s){if(s<e)throw zo(`Invalid value for '${n}'. Expected ${e} or greater.`);if(s>t)throw zo(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jt(n,e,t){let s=e;return t==null&&(s=`https://${e}`),`${t}://${s}/v0${n}`}function oy(n){const e=encodeURIComponent;let t="?";for(const s in n)if(n.hasOwnProperty(s)){const r=e(s)+"="+e(n[s]);t=t+r+"&"}return t=t.slice(0,-1),t}var Xn;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(Xn||(Xn={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ay(n,e){const t=n>=500&&n<600,r=[408,429].indexOf(n)!==-1,i=e.indexOf(n)!==-1;return t||r||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lb{constructor(e,t,s,r,i,o,c,l,u,d,p,_=!0,E=!1){this.url_=e,this.method_=t,this.headers_=s,this.body_=r,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=c,this.errorCallback_=l,this.timeout_=u,this.progressCallback_=d,this.connectionFactory_=p,this.retry=_,this.isUsingEmulator=E,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((C,k)=>{this.resolve_=C,this.reject_=k,this.start_()})}start_(){const e=(s,r)=>{if(r){s(!1,new lo(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=c=>{const l=c.loaded,u=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,u)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const c=i.getErrorCode()===Xn.NO_ERROR,l=i.getStatus();if(!c||ay(l,this.additionalRetryCodes_)&&this.retry){const d=i.getErrorCode()===Xn.ABORT;s(!1,new lo(!1,null,d));return}const u=this.successCodes_.indexOf(l)!==-1;s(!0,new lo(u,i))})},t=(s,r)=>{const i=this.resolve_,o=this.reject_,c=r.connection;if(r.wasSuccessCode)try{const l=this.callback_(c,c.getResponse());xb(l)?i(l):i()}catch(l){o(l)}else if(c!==null){const l=zu();l.serverResponse=c.getErrorText(),this.errorCallback_?o(this.errorCallback_(c,l)):o(l)}else if(r.canceled){const l=this.appDelete_?ry():ny();o(l)}else{const l=ty();o(l)}};this.canceled_?t(!1,new lo(!1,null,!0)):this.backoffId_=Db(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&Ob(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class lo{constructor(e,t,s){this.wasSuccessCode=e,this.connection=t,this.canceled=!!s}}function Fb(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function Ub(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function Bb(n,e){e&&(n["X-Firebase-GMPID"]=e)}function qb(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function $b(n,e,t,s,r,i,o=!0,c=!1){const l=oy(n.urlParams),u=n.url+l,d=Object.assign({},n.headers);return Bb(d,e),Fb(d,t),Ub(d,i),qb(d,s),new Lb(u,n.method,d,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,r,o,c)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jb(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Wb(...n){const e=jb();if(e!==void 0){const t=new e;for(let s=0;s<n.length;s++)t.append(n[s]);return t.getBlob()}else{if(Gu())return new Blob(n);throw new pe(ue.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Hb(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zb(n){if(typeof atob>"u")throw kb("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ut={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Hc{constructor(e,t){this.data=e,this.contentType=t||null}}function Ku(n,e){switch(n){case ut.RAW:return new Hc(cy(e));case ut.BASE64:case ut.BASE64URL:return new Hc(ly(n,e));case ut.DATA_URL:return new Hc(Kb(e),Qb(e))}throw zu()}function cy(n){const e=[];for(let t=0;t<n.length;t++){let s=n.charCodeAt(t);if(s<=127)e.push(s);else if(s<=2047)e.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const i=s,o=n.charCodeAt(++t);s=65536|(i&1023)<<10|o&1023,e.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?e.push(239,191,189):e.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(e)}function Gb(n){let e;try{e=decodeURIComponent(n)}catch{throw zr(ut.DATA_URL,"Malformed data URL.")}return cy(e)}function ly(n,e){switch(n){case ut.BASE64:{const r=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(r||i)throw zr(n,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case ut.BASE64URL:{const r=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(r||i)throw zr(n,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=zb(e)}catch(r){throw r.message.includes("polyfill")?r:zr(n,"Invalid character found")}const s=new Uint8Array(t.length);for(let r=0;r<t.length;r++)s[r]=t.charCodeAt(r);return s}class uy{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw zr(ut.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=t[1]||null;s!=null&&(this.base64=Yb(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=e.substring(e.indexOf(",")+1)}}function Kb(n){const e=new uy(n);return e.base64?ly(ut.BASE64,e.rest):Gb(e.rest)}function Qb(n){return new uy(n).contentType}function Yb(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(e,t){let s=0,r="";_p(e)?(this.data_=e,s=e.size,r=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),s=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),s=e.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(e,t){if(_p(this.data_)){const s=this.data_,r=Hb(s,e,t);return r===null?null:new Nt(r)}else{const s=new Uint8Array(this.data_.buffer,e,t-e);return new Nt(s,!0)}}static getBlob(...e){if(Gu()){const t=e.map(s=>s instanceof Nt?s.data_:s);return new Nt(Wb.apply(null,t))}else{const t=e.map(o=>ja(o)?Ku(ut.RAW,o).data:o.data_);let s=0;t.forEach(o=>{s+=o.byteLength});const r=new Uint8Array(s);let i=0;return t.forEach(o=>{for(let c=0;c<o.length;c++)r[i++]=o[c]}),new Nt(r,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qu(n){let e;try{e=JSON.parse(n)}catch{return null}return Vb(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xb(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function Jb(n,e){const t=e.split("/").filter(s=>s.length>0).join("/");return n.length===0?t:n+"/"+t}function hy(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zb(n,e){return e}class He{constructor(e,t,s,r){this.server=e,this.local=t||e,this.writable=!!s,this.xform=r||Zb}}let uo=null;function eP(n){return!ja(n)||n.length<2?n:hy(n)}function ki(){if(uo)return uo;const n=[];n.push(new He("bucket")),n.push(new He("generation")),n.push(new He("metageneration")),n.push(new He("name","fullPath",!0));function e(i,o){return eP(o)}const t=new He("name");t.xform=e,n.push(t);function s(i,o){return o!==void 0?Number(o):o}const r=new He("size");return r.xform=s,n.push(r),n.push(new He("timeCreated")),n.push(new He("updated")),n.push(new He("md5Hash",null,!0)),n.push(new He("cacheControl",null,!0)),n.push(new He("contentDisposition",null,!0)),n.push(new He("contentEncoding",null,!0)),n.push(new He("contentLanguage",null,!0)),n.push(new He("contentType",null,!0)),n.push(new He("metadata","customMetadata",!0)),uo=n,uo}function tP(n,e){function t(){const s=n.bucket,r=n.fullPath,i=new qe(s,r);return e._makeStorageReference(i)}Object.defineProperty(n,"ref",{get:t})}function nP(n,e,t){const s={};s.type="file";const r=t.length;for(let i=0;i<r;i++){const o=t[i];s[o.local]=o.xform(s,e[o.server])}return tP(s,n),s}function dy(n,e,t){const s=Qu(e);return s===null?null:nP(n,s,t)}function sP(n,e,t,s){const r=Qu(e);if(r===null||!ja(r.downloadTokens))return null;const i=r.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(u=>{const d=n.bucket,p=n.fullPath,_="/b/"+o(d)+"/o/"+o(p),E=Jt(_,t,s),C=oy({alt:"media",token:u});return E+C})[0]}function Yu(n,e){const t={},s=e.length;for(let r=0;r<s;r++){const i=e[r];i.writable&&(t[i.server]=n[i.local])}return JSON.stringify(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mp="prefixes",gp="items";function rP(n,e,t){const s={prefixes:[],items:[],nextPageToken:t.nextPageToken};if(t[mp])for(const r of t[mp]){const i=r.replace(/\/$/,""),o=n._makeStorageReference(new qe(e,i));s.prefixes.push(o)}if(t[gp])for(const r of t[gp]){const i=n._makeStorageReference(new qe(e,r.name));s.items.push(i)}return s}function iP(n,e,t){const s=Qu(t);return s===null?null:rP(n,e,s)}class Ut{constructor(e,t,s,r){this.url=e,this.method=t,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vt(n){if(!n)throw zu()}function Wa(n,e){function t(s,r){const i=dy(n,r,e);return Vt(i!==null),i}return t}function oP(n,e){function t(s,r){const i=iP(n,e,r);return Vt(i!==null),i}return t}function aP(n,e){function t(s,r){const i=dy(n,r,e);return Vt(i!==null),sP(i,r,n.host,n._protocol)}return t}function hr(n){function e(t,s){let r;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?r=Ib():r=wb():t.getStatus()===402?r=vb(n.bucket):t.getStatus()===403?r=Ab(n.path):r=s,r.status=t.getStatus(),r.serverResponse=s.serverResponse,r}return e}function Ni(n){const e=hr(n);function t(s,r){let i=e(s,r);return s.getStatus()===404&&(i=Tb(n.path)),i.serverResponse=r.serverResponse,i}return t}function fy(n,e,t){const s=e.fullServerUrl(),r=Jt(s,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,c=new Ut(r,i,Wa(n,t),o);return c.errorHandler=Ni(e),c}function cP(n,e,t,s,r){const i={};e.isRoot?i.prefix="":i.prefix=e.path+"/",t.length>0&&(i.delimiter=t),s&&(i.pageToken=s),r&&(i.maxResults=r);const o=e.bucketOnlyServerUrl(),c=Jt(o,n.host,n._protocol),l="GET",u=n.maxOperationRetryTime,d=new Ut(c,l,oP(n,e.bucket),u);return d.urlParams=i,d.errorHandler=hr(e),d}function py(n,e,t){const s=e.fullServerUrl(),r=Jt(s,n.host,n._protocol)+"?alt=media",i="GET",o=n.maxOperationRetryTime,c=new Ut(r,i,(l,u)=>u,o);return c.errorHandler=Ni(e),t!==void 0&&(c.headers.Range=`bytes=0-${t}`,c.successCodes=[200,206]),c}function lP(n,e,t){const s=e.fullServerUrl(),r=Jt(s,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,c=new Ut(r,i,aP(n,t),o);return c.errorHandler=Ni(e),c}function uP(n,e,t,s){const r=e.fullServerUrl(),i=Jt(r,n.host,n._protocol),o="PATCH",c=Yu(t,s),l={"Content-Type":"application/json; charset=utf-8"},u=n.maxOperationRetryTime,d=new Ut(i,o,Wa(n,s),u);return d.headers=l,d.body=c,d.errorHandler=Ni(e),d}function hP(n,e){const t=e.fullServerUrl(),s=Jt(t,n.host,n._protocol),r="DELETE",i=n.maxOperationRetryTime;function o(l,u){}const c=new Ut(s,r,o,i);return c.successCodes=[200,204],c.errorHandler=Ni(e),c}function dP(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function _y(n,e,t){const s=Object.assign({},t);return s.fullPath=n.path,s.size=e.size(),s.contentType||(s.contentType=dP(null,e)),s}function my(n,e,t,s,r){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function c(){let U="";for(let K=0;K<2;K++)U=U+Math.random().toString().slice(2);return U}const l=c();o["Content-Type"]="multipart/related; boundary="+l;const u=_y(e,s,r),d=Yu(u,t),p="--"+l+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+d+`\r
--`+l+`\r
Content-Type: `+u.contentType+`\r
\r
`,_=`\r
--`+l+"--",E=Nt.getBlob(p,s,_);if(E===null)throw sy();const C={name:u.fullPath},k=Jt(i,n.host,n._protocol),b="POST",V=n.maxUploadRetryTime,F=new Ut(k,b,Wa(n,t),V);return F.urlParams=C,F.headers=o,F.body=E.uploadData(),F.errorHandler=hr(e),F}class Go{constructor(e,t,s,r){this.current=e,this.total=t,this.finalized=!!s,this.metadata=r||null}}function Xu(n,e){let t=null;try{t=n.getResponseHeader("X-Goog-Upload-Status")}catch{Vt(!1)}return Vt(!!t&&(e||["active"]).indexOf(t)!==-1),t}function fP(n,e,t,s,r){const i=e.bucketOnlyServerUrl(),o=_y(e,s,r),c={name:o.fullPath},l=Jt(i,n.host,n._protocol),u="POST",d={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${s.size()}`,"X-Goog-Upload-Header-Content-Type":o.contentType,"Content-Type":"application/json; charset=utf-8"},p=Yu(o,t),_=n.maxUploadRetryTime;function E(k){Xu(k);let b;try{b=k.getResponseHeader("X-Goog-Upload-URL")}catch{Vt(!1)}return Vt(ja(b)),b}const C=new Ut(l,u,E,_);return C.urlParams=c,C.headers=d,C.body=p,C.errorHandler=hr(e),C}function pP(n,e,t,s){const r={"X-Goog-Upload-Command":"query"};function i(u){const d=Xu(u,["active","final"]);let p=null;try{p=u.getResponseHeader("X-Goog-Upload-Size-Received")}catch{Vt(!1)}p||Vt(!1);const _=Number(p);return Vt(!isNaN(_)),new Go(_,s.size(),d==="final")}const o="POST",c=n.maxUploadRetryTime,l=new Ut(t,o,i,c);return l.headers=r,l.errorHandler=hr(e),l}const yp=256*1024;function _P(n,e,t,s,r,i,o,c){const l=new Go(0,0);if(o?(l.current=o.current,l.total=o.total):(l.current=0,l.total=s.size()),s.size()!==l.total)throw bb();const u=l.total-l.current;let d=u;r>0&&(d=Math.min(d,r));const p=l.current,_=p+d;let E="";d===0?E="finalize":u===d?E="upload, finalize":E="upload";const C={"X-Goog-Upload-Command":E,"X-Goog-Upload-Offset":`${l.current}`},k=s.slice(p,_);if(k===null)throw sy();function b(K,Ee){const ae=Xu(K,["active","final"]),w=l.current+d,g=s.size();let T;return ae==="final"?T=Wa(e,i)(K,Ee):T=null,new Go(w,g,ae==="final",T)}const V="POST",F=e.maxUploadRetryTime,U=new Ut(t,V,b,F);return U.headers=C,U.body=k.uploadData(),U.progressCallback=c||null,U.errorHandler=hr(n),U}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mP={STATE_CHANGED:"state_changed"},ze={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function zc(n){switch(n){case"running":case"pausing":case"canceling":return ze.RUNNING;case"paused":return ze.PAUSED;case"success":return ze.SUCCESS;case"canceled":return ze.CANCELED;case"error":return ze.ERROR;default:return ze.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gP{constructor(e,t,s){if(Mb(e)||t!=null||s!=null)this.next=e,this.error=t??void 0,this.complete=s??void 0;else{const i=e;this.next=i.next,this.error=i.error,this.complete=i.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ys(n){return(...e)=>{Promise.resolve().then(()=>n(...e))}}class Ju{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Xn.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Xn.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Xn.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,s,r,i){if(this.sent_)throw Dr("cannot .send() more than once");if(ft(e)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),i!==void 0)for(const o in i)i.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,i[o].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw Dr("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw Dr("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw Dr("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw Dr("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class yP extends Ju{initXhr(){this.xhr_.responseType="text"}}function pt(){return new yP}class EP extends Ju{initXhr(){this.xhr_.responseType="arraybuffer"}}function TP(){return new EP}class vP extends Ju{initXhr(){this.xhr_.responseType="blob"}}function wP(){return new vP}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gy{isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}constructor(e,t,s=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=e,this._blob=t,this._metadata=s,this._mappings=ki(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=r=>{if(this._request=void 0,this._chunkMultiplier=1,r._codeEquals(ue.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const i=this.isExponentialBackoffExpired();if(ay(r.status,[]))if(i)r=ty();else{this.sleepTime=Math.max(this.sleepTime*2,Eb),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=r,this._transition("error")}},this._metadataErrorHandler=r=>{this._request=void 0,r._codeEquals(ue.CANCELED)?this.completeTransitions_():(this._error=r,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((r,i)=>{this._resolve=r,this._reject=i,this._start()}),this._promise.then(null,()=>{})}_makeProgressCallback(){const e=this._transferred;return t=>this._updateProgress(e+t)}_shouldDoResumable(e){return e.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(e){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([t,s])=>{switch(this._state){case"running":e(t,s);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((e,t)=>{const s=fP(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),r=this._ref.storage._makeRequest(s,pt,e,t);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._uploadUrl=i,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const e=this._uploadUrl;this._resolveToken((t,s)=>{const r=pP(this._ref.storage,this._ref._location,e,this._blob),i=this._ref.storage._makeRequest(r,pt,t,s);this._request=i,i.getPromise().then(o=>{o=o,this._request=void 0,this._updateProgress(o.current),this._needToFetchStatus=!1,o.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const e=yp*this._chunkMultiplier,t=new Go(this._transferred,this._blob.size()),s=this._uploadUrl;this._resolveToken((r,i)=>{let o;try{o=_P(this._ref._location,this._ref.storage,s,this._blob,e,this._mappings,t,this._makeProgressCallback())}catch(l){this._error=l,this._transition("error");return}const c=this._ref.storage._makeRequest(o,pt,r,i,!1);this._request=c,c.getPromise().then(l=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(l.current),l.finalized?(this._metadata=l.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){yp*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((e,t)=>{const s=fy(this._ref.storage,this._ref._location,this._mappings),r=this._ref.storage._makeRequest(s,pt,e,t);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((e,t)=>{const s=my(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),r=this._ref.storage._makeRequest(s,pt,e,t);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(e){const t=this._transferred;this._transferred=e,this._transferred!==t&&this._notifyObservers()}_transition(e){if(this._state!==e)switch(e){case"canceling":case"pausing":this._state=e,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const t=this._state==="paused";this._state=e,t&&(this._notifyObservers(),this._start());break;case"paused":this._state=e,this._notifyObservers();break;case"canceled":this._error=ny(),this._state=e,this._notifyObservers();break;case"error":this._state=e,this._notifyObservers();break;case"success":this._state=e,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const e=zc(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:e,metadata:this._metadata,task:this,ref:this._ref}}on(e,t,s,r){const i=new gP(t||void 0,s||void 0,r||void 0);return this._addObserver(i),()=>{this._removeObserver(i)}}then(e,t){return this._promise.then(e,t)}catch(e){return this.then(null,e)}_addObserver(e){this._observers.push(e),this._notifyObserver(e)}_removeObserver(e){const t=this._observers.indexOf(e);t!==-1&&this._observers.splice(t,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(t=>{this._notifyObserver(t)})}_finishPromise(){if(this._resolve!==void 0){let e=!0;switch(zc(this._state)){case ze.SUCCESS:ys(this._resolve.bind(null,this.snapshot))();break;case ze.CANCELED:case ze.ERROR:const t=this._reject;ys(t.bind(null,this._error))();break;default:e=!1;break}e&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(e){switch(zc(this._state)){case ze.RUNNING:case ze.PAUSED:e.next&&ys(e.next.bind(e,this.snapshot))();break;case ze.SUCCESS:e.complete&&ys(e.complete.bind(e))();break;case ze.CANCELED:case ze.ERROR:e.error&&ys(e.error.bind(e,this._error))();break;default:e.error&&ys(e.error.bind(e,this._error))()}}resume(){const e=this._state==="paused"||this._state==="pausing";return e&&this._transition("running"),e}pause(){const e=this._state==="running";return e&&this._transition("pausing"),e}cancel(){const e=this._state==="running"||this._state==="pausing";return e&&this._transition("canceling"),e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ss{constructor(e,t){this._service=e,t instanceof qe?this._location=t:this._location=qe.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new ss(e,t)}get root(){const e=new qe(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return hy(this._location.path)}get storage(){return this._service}get parent(){const e=Xb(this._location.path);if(e===null)return null;const t=new qe(this._location.bucket,e);return new ss(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw iy(e)}}function IP(n,e){n._throwIfRoot("getBytes");const t=py(n.storage,n._location,e);return n.storage.makeRequestWithTokens(t,TP).then(s=>e!==void 0?s.slice(0,e):s)}function AP(n,e){n._throwIfRoot("getBlob");const t=py(n.storage,n._location,e);return n.storage.makeRequestWithTokens(t,wP).then(s=>e!==void 0?s.slice(0,e):s)}function yy(n,e,t){n._throwIfRoot("uploadBytes");const s=my(n.storage,n._location,ki(),new Nt(e,!0),t);return n.storage.makeRequestWithTokens(s,pt).then(r=>({metadata:r,ref:n}))}function CP(n,e,t){return n._throwIfRoot("uploadBytesResumable"),new gy(n,new Nt(e),t)}function RP(n,e,t=ut.RAW,s){n._throwIfRoot("uploadString");const r=Ku(t,e),i={...s};return i.contentType==null&&r.contentType!=null&&(i.contentType=r.contentType),yy(n,r.data,i)}function SP(n){const e={prefixes:[],items:[]};return Ey(n,e).then(()=>e)}async function Ey(n,e,t){const r=await Ty(n,{pageToken:t});e.prefixes.push(...r.prefixes),e.items.push(...r.items),r.nextPageToken!=null&&await Ey(n,e,r.nextPageToken)}function Ty(n,e){e!=null&&typeof e.maxResults=="number"&&bl("options.maxResults",1,1e3,e.maxResults);const t=e||{},s=cP(n.storage,n._location,"/",t.pageToken,t.maxResults);return n.storage.makeRequestWithTokens(s,pt)}function bP(n){n._throwIfRoot("getMetadata");const e=fy(n.storage,n._location,ki());return n.storage.makeRequestWithTokens(e,pt)}function PP(n,e){n._throwIfRoot("updateMetadata");const t=uP(n.storage,n._location,e,ki());return n.storage.makeRequestWithTokens(t,pt)}function kP(n){n._throwIfRoot("getDownloadURL");const e=lP(n.storage,n._location,ki());return n.storage.makeRequestWithTokens(e,pt).then(t=>{if(t===null)throw Pb();return t})}function NP(n){n._throwIfRoot("deleteObject");const e=hP(n.storage,n._location);return n.storage.makeRequestWithTokens(e,pt)}function vy(n,e){const t=Jb(n._location.path,e),s=new qe(n._location.bucket,t);return new ss(n.storage,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function DP(n){return/^[A-Za-z]+:\/\//.test(n)}function OP(n,e){return new ss(n,e)}function wy(n,e){if(n instanceof Zu){const t=n;if(t._bucket==null)throw Sb();const s=new ss(t,t._bucket);return e!=null?wy(s,e):s}else return e!==void 0?vy(n,e):n}function xP(n,e){if(e&&DP(e)){if(n instanceof Zu)return OP(n,e);throw zo("To use ref(service, url), the first argument must be a Storage instance.")}else return wy(n,e)}function Ep(n,e){const t=e==null?void 0:e[ey];return t==null?null:qe.makeFromBucketSpec(t,n)}function MP(n,e,t,s={}){n.host=`${e}:${t}`;const r=ft(e);r&&(mi(`https://${n.host}/b`),gi("Storage",!0)),n._isUsingEmulator=!0,n._protocol=r?"https":"http";const{mockUserToken:i}=s;i&&(n._overrideAuthToken=typeof i=="string"?i:Wl(i,n.app.options.projectId))}class Zu{constructor(e,t,s,r,i,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=s,this._url=r,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=Zg,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=gb,this._maxUploadRetryTime=yb,this._requests=new Set,r!=null?this._bucket=qe.makeFromBucketSpec(r,this._host):this._bucket=Ep(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=qe.makeFromBucketSpec(this._url,e):this._bucket=Ep(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){bl("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){bl("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(Ke(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new ss(this,e)}_makeRequest(e,t,s,r,i=!0){if(this._deleted)return new Nb(ry());{const o=$b(e,this._appId,s,r,t,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,s,r).getPromise()}}const Tp="@firebase/storage",vp="0.14.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iy="storage";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function VP(n,e){return n=j(n),IP(n,e)}function LP(n,e,t){return n=j(n),yy(n,e,t)}function FP(n,e,t,s){return n=j(n),RP(n,e,t,s)}function UP(n,e,t){return n=j(n),CP(n,e,t)}function BP(n){return n=j(n),bP(n)}function qP(n,e){return n=j(n),PP(n,e)}function $P(n,e){return n=j(n),Ty(n,e)}function jP(n){return n=j(n),SP(n)}function WP(n){return n=j(n),kP(n)}function HP(n){return n=j(n),NP(n)}function zP(n,e){return n=j(n),xP(n,e)}function GP(n,e){return vy(n,e)}function KP(n=er(),e){n=j(n);const s=Mn(n,Iy).getImmediate({identifier:e}),r=da("storage");return r&&Ay(s,...r),s}function Ay(n,e,t,s={}){MP(n,e,t,s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QP(n,e){return n=j(n),AP(n,e)}function YP(n,e){throw new Error("getStream() is only supported by NodeJS builds")}function XP(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),s=n.getProvider("auth-internal"),r=n.getProvider("app-check-internal");return new Zu(t,s,r,e,Vn)}function JP(){wt(new dt(Iy,XP,"PUBLIC").setMultipleInstances(!0)),Ye(Tp,vp,""),Ye(Tp,vp,"esm2020")}JP();const jD=Object.freeze(Object.defineProperty({__proto__:null,StorageError:pe,get StorageErrorCode(){return ue},StringFormat:ut,_FbsBlob:Nt,_Location:qe,_TaskEvent:mP,_TaskState:ze,_UploadTask:gy,_dataFromString:Ku,_getChild:GP,_invalidArgument:zo,_invalidRootOperation:iy,connectStorageEmulator:Ay,deleteObject:HP,getBlob:QP,getBytes:VP,getDownloadURL:WP,getMetadata:BP,getStorage:KP,getStream:YP,list:$P,listAll:jP,ref:zP,updateMetadata:qP,uploadBytes:LP,uploadBytesResumable:UP,uploadString:FP},Symbol.toStringTag,{value:"Module"}));var wp={};const Ip="@firebase/database",Ap="1.1.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cy="";function ZP(n){Cy=n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ek{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),Ce(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Jr(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tk{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return Ct(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ry=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new ek(e)}}catch{}return new tk},Yn=Ry("localStorage"),nk=Ry("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ds=new yi("@firebase/database"),Sy=function(){let n=1;return function(){return n++}}(),by=function(n){const e=WT(n),t=new BT;t.update(e);const s=t.digest();return ua.encodeByteArray(s)},Di=function(...n){let e="";for(let t=0;t<n.length;t++){const s=n[t];Array.isArray(s)||s&&typeof s=="object"&&typeof s.length=="number"?e+=Di.apply(null,s):typeof s=="object"?e+=Ce(s):e+=s,e+=" "}return e};let Gr=null,Cp=!0;const sk=function(n,e){D(!0,"Can't turn on custom loggers persistently."),Ds.logLevel=X.VERBOSE,Gr=Ds.log.bind(Ds)},Oe=function(...n){if(Cp===!0&&(Cp=!1,Gr===null&&nk.get("logging_enabled")===!0&&sk()),Gr){const e=Di.apply(null,n);Gr(e)}},Oi=function(n){return function(...e){Oe(n,...e)}},Pl=function(...n){const e="FIREBASE INTERNAL ERROR: "+Di(...n);Ds.error(e)},Xt=function(...n){const e=`FIREBASE FATAL ERROR: ${Di(...n)}`;throw Ds.error(e),new Error(e)},Je=function(...n){const e="FIREBASE WARNING: "+Di(...n);Ds.warn(e)},rk=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&Je("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},Ha=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},ik=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},Ws="[MIN_NAME]",rs="[MAX_NAME]",ds=function(n,e){if(n===e)return 0;if(n===Ws||e===rs)return-1;if(e===Ws||n===rs)return 1;{const t=Rp(n),s=Rp(e);return t!==null?s!==null?t-s===0?n.length-e.length:t-s:-1:s!==null?1:n<e?-1:1}},ok=function(n,e){return n===e?0:n<e?-1:1},Or=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+Ce(e))},eh=function(n){if(typeof n!="object"||n===null)return Ce(n);const e=[];for(const s in n)e.push(s);e.sort();let t="{";for(let s=0;s<e.length;s++)s!==0&&(t+=","),t+=Ce(e[s]),t+=":",t+=eh(n[e[s]]);return t+="}",t},Py=function(n,e){const t=n.length;if(t<=e)return[n];const s=[];for(let r=0;r<t;r+=e)r+e>t?s.push(n.substring(r,t)):s.push(n.substring(r,r+e));return s};function Ve(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const ky=function(n){D(!Ha(n),"Invalid JSON number");const e=11,t=52,s=(1<<e-1)-1;let r,i,o,c,l;n===0?(i=0,o=0,r=1/n===-1/0?1:0):(r=n<0,n=Math.abs(n),n>=Math.pow(2,1-s)?(c=Math.min(Math.floor(Math.log(n)/Math.LN2),s),i=c+s,o=Math.round(n*Math.pow(2,t-c)-Math.pow(2,t))):(i=0,o=Math.round(n/Math.pow(2,1-s-t))));const u=[];for(l=t;l;l-=1)u.push(o%2?1:0),o=Math.floor(o/2);for(l=e;l;l-=1)u.push(i%2?1:0),i=Math.floor(i/2);u.push(r?1:0),u.reverse();const d=u.join("");let p="";for(l=0;l<64;l+=8){let _=parseInt(d.substr(l,8),2).toString(16);_.length===1&&(_="0"+_),p=p+_}return p.toLowerCase()},ak=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},ck=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function lk(n,e){let t="Unknown Error";n==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":n==="permission_denied"?t="Client doesn't have permission to access the desired data.":n==="unavailable"&&(t="The service is unavailable");const s=new Error(n+" at "+e._path.toString()+": "+t);return s.code=n.toUpperCase(),s}const uk=new RegExp("^-?(0*)\\d{1,10}$"),hk=-2147483648,dk=2147483647,Rp=function(n){if(uk.test(n)){const e=Number(n);if(e>=hk&&e<=dk)return e}return null},dr=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw Je("Exception was thrown by user callback.",t),e},Math.floor(0))}},fk=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},Kr=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pk{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,Ke(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(s=>this.appCheck=s)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,s)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)==null||t.get().then(s=>s.addTokenListener(e))}notifyForInvalidToken(){Je(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _k{constructor(e,t,s){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=s,this.auth_=null,this.auth_=s.getImmediate({optional:!0}),this.auth_||s.onInit(r=>this.auth_=r)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(Oe("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,s)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',Je(e)}}class Io{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}Io.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const th="5",Ny="v",Dy="s",Oy="r",xy="f",My=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,Vy="ls",Ly="p",kl="ac",Fy="websocket",Uy="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class By{constructor(e,t,s,r,i=!1,o="",c=!1,l=!1,u=null){this.secure=t,this.namespace=s,this.webSocketOnly=r,this.nodeAdmin=i,this.persistenceKey=o,this.includeNamespaceInQueryParams=c,this.isUsingEmulator=l,this.emulatorOptions=u,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=Yn.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&Yn.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function mk(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function qy(n,e,t){D(typeof e=="string","typeof type must == string"),D(typeof t=="object","typeof params must == object");let s;if(e===Fy)s=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Uy)s=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);mk(n)&&(t.ns=n.namespace);const r=[];return Ve(t,(i,o)=>{r.push(i+"="+o)}),s+r.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gk{constructor(){this.counters_={}}incrementCounter(e,t=1){Ct(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return vT(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gc={},Kc={};function nh(n){const e=n.toString();return Gc[e]||(Gc[e]=new gk),Gc[e]}function yk(n,e){const t=n.toString();return Kc[t]||(Kc[t]=e()),Kc[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ek{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const s=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let r=0;r<s.length;++r)s[r]&&dr(()=>{this.onMessage_(s[r])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sp="start",Tk="close",vk="pLPCommand",wk="pRTLPCB",$y="id",jy="pw",Wy="ser",Ik="cb",Ak="seg",Ck="ts",Rk="d",Sk="dframe",Hy=1870,zy=30,bk=Hy-zy,Pk=25e3,kk=3e4;class Cs{constructor(e,t,s,r,i,o,c){this.connId=e,this.repoInfo=t,this.applicationId=s,this.appCheckToken=r,this.authToken=i,this.transportSessionId=o,this.lastSessionId=c,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=Oi(e),this.stats_=nh(t),this.urlFn=l=>(this.appCheckToken&&(l[kl]=this.appCheckToken),qy(t,Uy,l))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new Ek(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(kk)),ik(()=>{if(this.isClosed_)return;this.scriptTagHolder=new sh((...i)=>{const[o,c,l,u,d]=i;if(this.incrementIncomingBytes_(i),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===Sp)this.id=c,this.password=l;else if(o===Tk)c?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(c,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...i)=>{const[o,c]=i;this.incrementIncomingBytes_(i),this.myPacketOrderer.handleResponse(o,c)},()=>{this.onClosed_()},this.urlFn);const s={};s[Sp]="t",s[Wy]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(s[Ik]=this.scriptTagHolder.uniqueCallbackIdentifier),s[Ny]=th,this.transportSessionId&&(s[Dy]=this.transportSessionId),this.lastSessionId&&(s[Vy]=this.lastSessionId),this.applicationId&&(s[Ly]=this.applicationId),this.appCheckToken&&(s[kl]=this.appCheckToken),typeof location<"u"&&location.hostname&&My.test(location.hostname)&&(s[Oy]=xy);const r=this.urlFn(s);this.log_("Connecting via long-poll to "+r),this.scriptTagHolder.addTag(r,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){Cs.forceAllow_=!0}static forceDisallow(){Cs.forceDisallow_=!0}static isAvailable(){return Cs.forceAllow_?!0:!Cs.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!ak()&&!ck()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=Ce(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=c_(t),r=Py(s,bk);for(let i=0;i<r.length;i++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,r.length,r[i]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const s={};s[Sk]="t",s[$y]=e,s[jy]=t,this.myDisconnFrame.src=this.urlFn(s),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=Ce(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class sh{constructor(e,t,s,r){this.onDisconnect=s,this.urlFn=r,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=Sy(),window[vk+this.uniqueCallbackIdentifier]=e,window[wk+this.uniqueCallbackIdentifier]=t,this.myIFrame=sh.createIFrame_();let i="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(i='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+i+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(c){Oe("frame writing exception"),c.stack&&Oe(c.stack),Oe(c)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||Oe("No IE domain setting required")}catch{const s=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+s+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[$y]=this.myID,e[jy]=this.myPW,e[Wy]=this.currentSerial;let t=this.urlFn(e),s="",r=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+zy+s.length<=Hy;){const o=this.pendingSegs.shift();s=s+"&"+Ak+r+"="+o.seg+"&"+Ck+r+"="+o.ts+"&"+Rk+r+"="+o.d,r++}return t=t+s,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,s){this.pendingSegs.push({seg:e,ts:t,d:s}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const s=()=>{this.outstandingRequests.delete(t),this.newRequest_()},r=setTimeout(s,Math.floor(Pk)),i=()=>{clearTimeout(r),s()};this.addTag(e,i)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const s=this.myIFrame.doc.createElement("script");s.type="text/javascript",s.async=!0,s.src=e,s.onload=s.onreadystatechange=function(){const r=s.readyState;(!r||r==="loaded"||r==="complete")&&(s.onload=s.onreadystatechange=null,s.parentNode&&s.parentNode.removeChild(s),t())},s.onerror=()=>{Oe("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(s)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nk=16384,Dk=45e3;let Ko=null;typeof MozWebSocket<"u"?Ko=MozWebSocket:typeof WebSocket<"u"&&(Ko=WebSocket);class _t{constructor(e,t,s,r,i,o,c){this.connId=e,this.applicationId=s,this.appCheckToken=r,this.authToken=i,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=Oi(this.connId),this.stats_=nh(t),this.connURL=_t.connectionURL_(t,o,c,r,s),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,s,r,i){const o={};return o[Ny]=th,typeof location<"u"&&location.hostname&&My.test(location.hostname)&&(o[Oy]=xy),t&&(o[Dy]=t),s&&(o[Vy]=s),r&&(o[kl]=r),i&&(o[Ly]=i),qy(e,Fy,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,Yn.set("previous_websocket_failure",!0);try{let s;DT(),this.mySock=new Ko(this.connURL,[],s)}catch(s){this.log_("Error instantiating WebSocket.");const r=s.message||s.data;r&&this.log_(r),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=s=>{this.handleIncomingFrame(s)},this.mySock.onerror=s=>{this.log_("WebSocket error.  Closing connection.");const r=s.message||s.data;r&&this.log_(r),this.onClosed_()}}start(){}static forceDisallow(){_t.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,s=navigator.userAgent.match(t);s&&s.length>1&&parseFloat(s[1])<4.4&&(e=!0)}return!e&&Ko!==null&&!_t.forceDisallow_}static previouslyFailed(){return Yn.isInMemoryStorage||Yn.get("previous_websocket_failure")===!0}markConnectionHealthy(){Yn.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const s=Jr(t);this.onMessage(s)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(D(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const s=this.extractFrameCount_(t);s!==null&&this.appendFrame_(s)}}send(e){this.resetKeepAlive();const t=Ce(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=Py(t,Nk);s.length>1&&this.sendString_(String(s.length));for(let r=0;r<s.length;r++)this.sendString_(s[r])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(Dk))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}_t.responsesRequiredToBeHealthy=2;_t.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li{static get ALL_TRANSPORTS(){return[Cs,_t]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=_t&&_t.isAvailable();let s=t&&!_t.previouslyFailed();if(e.webSocketOnly&&(t||Je("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),s=!0),s)this.transports_=[_t];else{const r=this.transports_=[];for(const i of li.ALL_TRANSPORTS)i&&i.isAvailable()&&r.push(i);li.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}li.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ok=6e4,xk=5e3,Mk=10*1024,Vk=100*1024,Qc="t",bp="d",Lk="s",Pp="r",Fk="e",kp="o",Np="a",Dp="n",Op="p",Uk="h";class Bk{constructor(e,t,s,r,i,o,c,l,u,d){this.id=e,this.repoInfo_=t,this.applicationId_=s,this.appCheckToken_=r,this.authToken_=i,this.onMessage_=o,this.onReady_=c,this.onDisconnect_=l,this.onKill_=u,this.lastSessionId=d,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=Oi("c:"+this.id+":"),this.transportManager_=new li(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),s=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,s)},Math.floor(0));const r=e.healthyTimeout||0;r>0&&(this.healthyTimeout_=Kr(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>Vk?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>Mk?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(r)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(Qc in e){const t=e[Qc];t===Np?this.upgradeIfSecondaryHealthy_():t===Pp?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===kp&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=Or("t",e),s=Or("d",e);if(t==="c")this.onSecondaryControl_(s);else if(t==="d")this.pendingDataMessages.push(s);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:Op,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:Np,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Dp,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=Or("t",e),s=Or("d",e);t==="c"?this.onControl_(s):t==="d"&&this.onDataMessage_(s)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=Or(Qc,e);if(bp in e){const s=e[bp];if(t===Uk){const r={...s};this.repoInfo_.isUsingEmulator&&(r.h=this.repoInfo_.host),this.onHandshake_(r)}else if(t===Dp){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let r=0;r<this.pendingDataMessages.length;++r)this.onDataMessage_(this.pendingDataMessages[r]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===Lk?this.onConnectionShutdown_(s):t===Pp?this.onReset_(s):t===Fk?Pl("Server Error: "+s):t===kp?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):Pl("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,s=e.v,r=e.h;this.sessionId=e.s,this.repoInfo_.host=r,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),th!==s&&Je("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),s=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,s),Kr(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(Ok))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):Kr(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(xk))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:Op,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(Yn.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gy{put(e,t,s,r){}merge(e,t,s,r){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,s){}onDisconnectMerge(e,t,s){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ky{constructor(e){this.allowedEvents_=e,this.listeners_={},D(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const s=[...this.listeners_[e]];for(let r=0;r<s.length;r++)s[r].callback.apply(s[r].context,t)}}on(e,t,s){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:s});const r=this.getInitialEvent(e);r&&t.apply(s,r)}off(e,t,s){this.validateEventType_(e);const r=this.listeners_[e]||[];for(let i=0;i<r.length;i++)if(r[i].callback===t&&(!s||s===r[i].context)){r.splice(i,1);return}}validateEventType_(e){D(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qo extends Ky{static getInstance(){return new Qo}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!Hl()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return D(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xp=32,Mp=768;class se{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let s=0;for(let r=0;r<this.pieces_.length;r++)this.pieces_[r].length>0&&(this.pieces_[s]=this.pieces_[r],s++);this.pieces_.length=s,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function te(){return new se("")}function G(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function Nn(n){return n.pieces_.length-n.pieceNum_}function ie(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new se(n.pieces_,e)}function rh(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function qk(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function ui(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function Qy(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new se(e,0)}function me(n,e){const t=[];for(let s=n.pieceNum_;s<n.pieces_.length;s++)t.push(n.pieces_[s]);if(e instanceof se)for(let s=e.pieceNum_;s<e.pieces_.length;s++)t.push(e.pieces_[s]);else{const s=e.split("/");for(let r=0;r<s.length;r++)s[r].length>0&&t.push(s[r])}return new se(t,0)}function Q(n){return n.pieceNum_>=n.pieces_.length}function Qe(n,e){const t=G(n),s=G(e);if(t===null)return e;if(t===s)return Qe(ie(n),ie(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function $k(n,e){const t=ui(n,0),s=ui(e,0);for(let r=0;r<t.length&&r<s.length;r++){const i=ds(t[r],s[r]);if(i!==0)return i}return t.length===s.length?0:t.length<s.length?-1:1}function ih(n,e){if(Nn(n)!==Nn(e))return!1;for(let t=n.pieceNum_,s=e.pieceNum_;t<=n.pieces_.length;t++,s++)if(n.pieces_[t]!==e.pieces_[s])return!1;return!0}function ht(n,e){let t=n.pieceNum_,s=e.pieceNum_;if(Nn(n)>Nn(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[s])return!1;++t,++s}return!0}class jk{constructor(e,t){this.errorPrefix_=t,this.parts_=ui(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let s=0;s<this.parts_.length;s++)this.byteLength_+=fa(this.parts_[s]);Yy(this)}}function Wk(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=fa(e),Yy(n)}function Hk(n){const e=n.parts_.pop();n.byteLength_-=fa(e),n.parts_.length>0&&(n.byteLength_-=1)}function Yy(n){if(n.byteLength_>Mp)throw new Error(n.errorPrefix_+"has a key path longer than "+Mp+" bytes ("+n.byteLength_+").");if(n.parts_.length>xp)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+xp+") or object contains a cycle "+Gn(n))}function Gn(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oh extends Ky{static getInstance(){return new oh}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const s=!document[e];s!==this.visible_&&(this.visible_=s,this.trigger("visible",s))},!1)}getInitialEvent(e){return D(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr=1e3,zk=60*5*1e3,Vp=30*1e3,Gk=1.3,Kk=3e4,Qk="server_kill",Lp=3;class Ht extends Gy{constructor(e,t,s,r,i,o,c,l){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=s,this.onConnectStatus_=r,this.onServerInfoUpdate_=i,this.authTokenProvider_=o,this.appCheckTokenProvider_=c,this.authOverride_=l,this.id=Ht.nextPersistentConnectionId_++,this.log_=Oi("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=xr,this.maxReconnectDelay_=zk,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,l)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");oh.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&Qo.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,s){const r=++this.requestNumber_,i={r,a:e,b:t};this.log_(Ce(i)),D(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(i),s&&(this.requestCBHash_[r]=s)}get(e){this.initConnection_();const t=new Ge,r={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const c=o.d;o.s==="ok"?t.resolve(c):t.reject(c)}};this.outstandingGets_.push(r),this.outstandingGetCount_++;const i=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(i),t.promise}listen(e,t,s,r){this.initConnection_();const i=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+i),this.listens.has(o)||this.listens.set(o,new Map),D(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),D(!this.listens.get(o).has(i),"listen() called twice for same path/queryId.");const c={onComplete:r,hashFn:t,query:e,tag:s};this.listens.get(o).set(i,c),this.connected_&&this.sendListen_(c)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,s=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(s)})}sendListen_(e){const t=e.query,s=t._path.toString(),r=t._queryIdentifier;this.log_("Listen on "+s+" for "+r);const i={p:s},o="q";e.tag&&(i.q=t._queryObject,i.t=e.tag),i.h=e.hashFn(),this.sendRequest(o,i,c=>{const l=c.d,u=c.s;Ht.warnOnListenWarnings_(l,t),(this.listens.get(s)&&this.listens.get(s).get(r))===e&&(this.log_("listen response",c),u!=="ok"&&this.removeListen_(s,r),e.onComplete&&e.onComplete(u,l))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&Ct(e,"w")){const s=Jn(e,"w");if(Array.isArray(s)&&~s.indexOf("no_index")){const r='".indexOn": "'+t._queryParams.getIndex().toString()+'"',i=t._path.toString();Je(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${r} at ${i} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||UT(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=Vp)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=FT(e)?"auth":"gauth",s={cred:e};this.authOverride_===null?s.noauth=!0:typeof this.authOverride_=="object"&&(s.authvar=this.authOverride_),this.sendRequest(t,s,r=>{const i=r.s,o=r.d||"error";this.authToken_===e&&(i==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(i,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,s=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,s)})}unlisten(e,t){const s=e._path.toString(),r=e._queryIdentifier;this.log_("Unlisten called for "+s+" "+r),D(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(s,r)&&this.connected_&&this.sendUnlisten_(s,r,e._queryObject,t)}sendUnlisten_(e,t,s,r){this.log_("Unlisten on "+e+" for "+t);const i={p:e},o="n";r&&(i.q=s,i.t=r),this.sendRequest(o,i)}onDisconnectPut(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:s})}onDisconnectMerge(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:s})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,s,r){const i={p:t,d:s};this.log_("onDisconnect "+e,i),this.sendRequest(e,i,o=>{r&&setTimeout(()=>{r(o.s,o.d)},Math.floor(0))})}put(e,t,s,r){this.putInternal("p",e,t,s,r)}merge(e,t,s,r){this.putInternal("m",e,t,s,r)}putInternal(e,t,s,r,i){this.initConnection_();const o={p:t,d:s};i!==void 0&&(o.h=i),this.outstandingPuts_.push({action:e,request:o,onComplete:r}),this.outstandingPutCount_++;const c=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(c):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,s=this.outstandingPuts_[e].request,r=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,s,i=>{this.log_(t+" response",i),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),r&&r(i.s,i.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,s=>{if(s.s!=="ok"){const i=s.d;this.log_("reportStats","Error sending stats: "+i)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+Ce(e));const t=e.r,s=this.requestCBHash_[t];s&&(delete this.requestCBHash_[t],s(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):Pl("Unrecognized action received from server: "+Ce(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){D(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=xr,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=xr,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>Kk&&(this.reconnectDelay_=xr),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*Gk)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),s=this.onRealtimeDisconnect_.bind(this),r=this.id+":"+Ht.nextConnectionId_++,i=this.lastSessionId;let o=!1,c=null;const l=function(){c?c.close():(o=!0,s())},u=function(p){D(c,"sendRequest call when we're not connected not allowed."),c.sendRequest(p)};this.realtime_={close:l,sendRequest:u};const d=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[p,_]=await Promise.all([this.authTokenProvider_.getToken(d),this.appCheckTokenProvider_.getToken(d)]);o?Oe("getToken() completed but was canceled"):(Oe("getToken() completed. Creating connection."),this.authToken_=p&&p.accessToken,this.appCheckToken_=_&&_.token,c=new Bk(r,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,s,E=>{Je(E+" ("+this.repoInfo_.toString()+")"),this.interrupt(Qk)},i))}catch(p){this.log_("Failed to get token: "+p),o||(this.repoInfo_.nodeAdmin&&Je(p),l())}}}interrupt(e){Oe("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){Oe("Resuming connection for reason: "+e),delete this.interruptReasons_[e],Ro(this.interruptReasons_)&&(this.reconnectDelay_=xr,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let s;t?s=t.map(i=>eh(i)).join("$"):s="default";const r=this.removeListen_(e,s);r&&r.onComplete&&r.onComplete("permission_denied")}removeListen_(e,t){const s=new se(e).toString();let r;if(this.listens.has(s)){const i=this.listens.get(s);r=i.get(t),i.delete(t),i.size===0&&this.listens.delete(s)}else r=void 0;return r}onAuthRevoked_(e,t){Oe("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=Lp&&(this.reconnectDelay_=Vp,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){Oe("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=Lp&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+Cy.replace(/\./g,"-")]=1,Hl()?e["framework.cordova"]=1:p_()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=Qo.getInstance().currentlyOnline();return Ro(this.interruptReasons_)&&e}}Ht.nextPersistentConnectionId_=0;Ht.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new Y(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class za{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const s=new Y(Ws,e),r=new Y(Ws,t);return this.compare(s,r)!==0}minPost(){return Y.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ho;class Xy extends za{static get __EMPTY_NODE(){return ho}static set __EMPTY_NODE(e){ho=e}compare(e,t){return ds(e.name,t.name)}isDefinedOn(e){throw Xs("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return Y.MIN}maxPost(){return new Y(rs,ho)}makePost(e,t){return D(typeof e=="string","KeyIndex indexValue must always be a string."),new Y(e,ho)}toString(){return".key"}}const Os=new Xy;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fo{constructor(e,t,s,r,i=null){this.isReverse_=r,this.resultGenerator_=i,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?s(e.key,t):1,r&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class De{constructor(e,t,s,r,i){this.key=e,this.value=t,this.color=s??De.RED,this.left=r??st.EMPTY_NODE,this.right=i??st.EMPTY_NODE}copy(e,t,s,r,i){return new De(e??this.key,t??this.value,s??this.color,r??this.left,i??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let r=this;const i=s(e,r.key);return i<0?r=r.copy(null,null,null,r.left.insert(e,t,s),null):i===0?r=r.copy(null,t,null,null,null):r=r.copy(null,null,null,null,r.right.insert(e,t,s)),r.fixUp_()}removeMin_(){if(this.left.isEmpty())return st.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let s,r;if(s=this,t(e,s.key)<0)!s.left.isEmpty()&&!s.left.isRed_()&&!s.left.left.isRed_()&&(s=s.moveRedLeft_()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed_()&&(s=s.rotateRight_()),!s.right.isEmpty()&&!s.right.isRed_()&&!s.right.left.isRed_()&&(s=s.moveRedRight_()),t(e,s.key)===0){if(s.right.isEmpty())return st.EMPTY_NODE;r=s.right.min_(),s=s.copy(r.key,r.value,null,null,s.right.removeMin_())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,De.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,De.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}De.RED=!0;De.BLACK=!1;class Yk{copy(e,t,s,r,i){return this}insert(e,t,s){return new De(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class st{constructor(e,t=st.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new st(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,De.BLACK,null,null))}remove(e){return new st(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,De.BLACK,null,null))}get(e){let t,s=this.root_;for(;!s.isEmpty();){if(t=this.comparator_(e,s.key),t===0)return s.value;t<0?s=s.left:t>0&&(s=s.right)}return null}getPredecessorKey(e){let t,s=this.root_,r=null;for(;!s.isEmpty();)if(t=this.comparator_(e,s.key),t===0){if(s.left.isEmpty())return r?r.key:null;for(s=s.left;!s.right.isEmpty();)s=s.right;return s.key}else t<0?s=s.left:t>0&&(r=s,s=s.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new fo(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new fo(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new fo(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new fo(this.root_,null,this.comparator_,!0,e)}}st.EMPTY_NODE=new Yk;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xk(n,e){return ds(n.name,e.name)}function ah(n,e){return ds(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Nl;function Jk(n){Nl=n}const Jy=function(n){return typeof n=="number"?"number:"+ky(n):"string:"+n},Zy=function(n){if(n.isLeafNode()){const e=n.val();D(typeof e=="string"||typeof e=="number"||typeof e=="object"&&Ct(e,".sv"),"Priority must be a string or number.")}else D(n===Nl||n.isEmpty(),"priority of unexpected type.");D(n===Nl||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Fp;class ke{static set __childrenNodeConstructor(e){Fp=e}static get __childrenNodeConstructor(){return Fp}constructor(e,t=ke.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,D(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),Zy(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new ke(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:ke.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return Q(e)?this:G(e)===".priority"?this.priorityNode_:ke.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:ke.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const s=G(e);return s===null?t:t.isEmpty()&&s!==".priority"?this:(D(s!==".priority"||Nn(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(s,ke.__childrenNodeConstructor.EMPTY_NODE.updateChild(ie(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+Jy(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=ky(this.value_):e+=this.value_,this.lazyHash_=by(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===ke.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof ke.__childrenNodeConstructor?-1:(D(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,s=typeof this.value_,r=ke.VALUE_TYPE_ORDER.indexOf(t),i=ke.VALUE_TYPE_ORDER.indexOf(s);return D(r>=0,"Unknown leaf type: "+t),D(i>=0,"Unknown leaf type: "+s),r===i?s==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:i-r}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}ke.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let eE,tE;function Zk(n){eE=n}function eN(n){tE=n}class tN extends za{compare(e,t){const s=e.node.getPriority(),r=t.node.getPriority(),i=s.compareTo(r);return i===0?ds(e.name,t.name):i}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return Y.MIN}maxPost(){return new Y(rs,new ke("[PRIORITY-POST]",tE))}makePost(e,t){const s=eE(e);return new Y(t,new ke("[PRIORITY-POST]",s))}toString(){return".priority"}}const fe=new tN;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nN=Math.log(2);class sN{constructor(e){const t=i=>parseInt(Math.log(i)/nN,10),s=i=>parseInt(Array(i+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const r=s(this.count);this.bits_=e+1&r}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Yo=function(n,e,t,s){n.sort(e);const r=function(l,u){const d=u-l;let p,_;if(d===0)return null;if(d===1)return p=n[l],_=t?t(p):p,new De(_,p.node,De.BLACK,null,null);{const E=parseInt(d/2,10)+l,C=r(l,E),k=r(E+1,u);return p=n[E],_=t?t(p):p,new De(_,p.node,De.BLACK,C,k)}},i=function(l){let u=null,d=null,p=n.length;const _=function(C,k){const b=p-C,V=p;p-=C;const F=r(b+1,V),U=n[b],K=t?t(U):U;E(new De(K,U.node,k,null,F))},E=function(C){u?(u.left=C,u=C):(d=C,u=C)};for(let C=0;C<l.count;++C){const k=l.nextBitIsOne(),b=Math.pow(2,l.count-(C+1));k?_(b,De.BLACK):(_(b,De.BLACK),_(b,De.RED))}return d},o=new sN(n.length),c=i(o);return new st(s||e,c)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Yc;const Es={};class jt{static get Default(){return D(Es&&fe,"ChildrenNode.ts has not been loaded"),Yc=Yc||new jt({".priority":Es},{".priority":fe}),Yc}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=Jn(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof st?t:null}hasIndex(e){return Ct(this.indexSet_,e.toString())}addIndex(e,t){D(e!==Os,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const s=[];let r=!1;const i=t.getIterator(Y.Wrap);let o=i.getNext();for(;o;)r=r||e.isDefinedOn(o.node),s.push(o),o=i.getNext();let c;r?c=Yo(s,e.getCompare()):c=Es;const l=e.toString(),u={...this.indexSet_};u[l]=e;const d={...this.indexes_};return d[l]=c,new jt(d,u)}addToIndexes(e,t){const s=So(this.indexes_,(r,i)=>{const o=Jn(this.indexSet_,i);if(D(o,"Missing index implementation for "+i),r===Es)if(o.isDefinedOn(e.node)){const c=[],l=t.getIterator(Y.Wrap);let u=l.getNext();for(;u;)u.name!==e.name&&c.push(u),u=l.getNext();return c.push(e),Yo(c,o.getCompare())}else return Es;else{const c=t.get(e.name);let l=r;return c&&(l=l.remove(new Y(e.name,c))),l.insert(e,e.node)}});return new jt(s,this.indexSet_)}removeFromIndexes(e,t){const s=So(this.indexes_,r=>{if(r===Es)return r;{const i=t.get(e.name);return i?r.remove(new Y(e.name,i)):r}});return new jt(s,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Mr;class B{static get EMPTY_NODE(){return Mr||(Mr=new B(new st(ah),null,jt.Default))}constructor(e,t,s){this.children_=e,this.priorityNode_=t,this.indexMap_=s,this.lazyHash_=null,this.priorityNode_&&Zy(this.priorityNode_),this.children_.isEmpty()&&D(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Mr}updatePriority(e){return this.children_.isEmpty()?this:new B(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Mr:t}}getChild(e){const t=G(e);return t===null?this:this.getImmediateChild(t).getChild(ie(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(D(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const s=new Y(e,t);let r,i;t.isEmpty()?(r=this.children_.remove(e),i=this.indexMap_.removeFromIndexes(s,this.children_)):(r=this.children_.insert(e,t),i=this.indexMap_.addToIndexes(s,this.children_));const o=r.isEmpty()?Mr:this.priorityNode_;return new B(r,o,i)}}updateChild(e,t){const s=G(e);if(s===null)return t;{D(G(e)!==".priority"||Nn(e)===1,".priority must be the last token in a path");const r=this.getImmediateChild(s).updateChild(ie(e),t);return this.updateImmediateChild(s,r)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let s=0,r=0,i=!0;if(this.forEachChild(fe,(o,c)=>{t[o]=c.val(e),s++,i&&B.INTEGER_REGEXP_.test(o)?r=Math.max(r,Number(o)):i=!1}),!e&&i&&r<2*s){const o=[];for(const c in t)o[c]=t[c];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+Jy(this.getPriority().val())+":"),this.forEachChild(fe,(t,s)=>{const r=s.hash();r!==""&&(e+=":"+t+":"+r)}),this.lazyHash_=e===""?"":by(e)}return this.lazyHash_}getPredecessorChildName(e,t,s){const r=this.resolveIndex_(s);if(r){const i=r.getPredecessorKey(new Y(e,t));return i?i.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.minKey();return s&&s.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new Y(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.maxKey();return s&&s.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new Y(t,this.children_.get(t)):null}forEachChild(e,t){const s=this.resolveIndex_(e);return s?s.inorderTraversal(r=>t(r.name,r.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getIteratorFrom(e,r=>r);{const r=this.children_.getIteratorFrom(e.name,Y.Wrap);let i=r.peek();for(;i!=null&&t.compare(i,e)<0;)r.getNext(),i=r.peek();return r}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getReverseIteratorFrom(e,r=>r);{const r=this.children_.getReverseIteratorFrom(e.name,Y.Wrap);let i=r.peek();for(;i!=null&&t.compare(i,e)>0;)r.getNext(),i=r.peek();return r}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===xi?-1:0}withIndex(e){if(e===Os||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new B(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===Os||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const s=this.getIterator(fe),r=t.getIterator(fe);let i=s.getNext(),o=r.getNext();for(;i&&o;){if(i.name!==o.name||!i.node.equals(o.node))return!1;i=s.getNext(),o=r.getNext()}return i===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===Os?null:this.indexMap_.get(e.toString())}}B.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class rN extends B{constructor(){super(new st(ah),B.EMPTY_NODE,jt.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return B.EMPTY_NODE}isEmpty(){return!1}}const xi=new rN;Object.defineProperties(Y,{MIN:{value:new Y(Ws,B.EMPTY_NODE)},MAX:{value:new Y(rs,xi)}});Xy.__EMPTY_NODE=B.EMPTY_NODE;ke.__childrenNodeConstructor=B;Jk(xi);eN(xi);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iN=!0;function _e(n,e=null){if(n===null)return B.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),D(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new ke(t,_e(e))}if(!(n instanceof Array)&&iN){const t=[];let s=!1;if(Ve(n,(o,c)=>{if(o.substring(0,1)!=="."){const l=_e(c);l.isEmpty()||(s=s||!l.getPriority().isEmpty(),t.push(new Y(o,l)))}}),t.length===0)return B.EMPTY_NODE;const i=Yo(t,Xk,o=>o.name,ah);if(s){const o=Yo(t,fe.getCompare());return new B(i,_e(e),new jt({".priority":o},{".priority":fe}))}else return new B(i,_e(e),jt.Default)}else{let t=B.EMPTY_NODE;return Ve(n,(s,r)=>{if(Ct(n,s)&&s.substring(0,1)!=="."){const i=_e(r);(i.isLeafNode()||!i.isEmpty())&&(t=t.updateImmediateChild(s,i))}}),t.updatePriority(_e(e))}}Zk(_e);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oN extends za{constructor(e){super(),this.indexPath_=e,D(!Q(e)&&G(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const s=this.extractChild(e.node),r=this.extractChild(t.node),i=s.compareTo(r);return i===0?ds(e.name,t.name):i}makePost(e,t){const s=_e(e),r=B.EMPTY_NODE.updateChild(this.indexPath_,s);return new Y(t,r)}maxPost(){const e=B.EMPTY_NODE.updateChild(this.indexPath_,xi);return new Y(rs,e)}toString(){return ui(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aN extends za{compare(e,t){const s=e.node.compareTo(t.node);return s===0?ds(e.name,t.name):s}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return Y.MIN}maxPost(){return Y.MAX}makePost(e,t){const s=_e(e);return new Y(t,s)}toString(){return".value"}}const cN=new aN;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nE(n){return{type:"value",snapshotNode:n}}function Hs(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function hi(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function di(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function lN(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ch{constructor(e){this.index_=e}updateChild(e,t,s,r,i,o){D(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const c=e.getImmediateChild(t);return c.getChild(r).equals(s.getChild(r))&&c.isEmpty()===s.isEmpty()||(o!=null&&(s.isEmpty()?e.hasChild(t)?o.trackChildChange(hi(t,c)):D(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):c.isEmpty()?o.trackChildChange(Hs(t,s)):o.trackChildChange(di(t,s,c))),e.isLeafNode()&&s.isEmpty())?e:e.updateImmediateChild(t,s).withIndex(this.index_)}updateFullNode(e,t,s){return s!=null&&(e.isLeafNode()||e.forEachChild(fe,(r,i)=>{t.hasChild(r)||s.trackChildChange(hi(r,i))}),t.isLeafNode()||t.forEachChild(fe,(r,i)=>{if(e.hasChild(r)){const o=e.getImmediateChild(r);o.equals(i)||s.trackChildChange(di(r,i,o))}else s.trackChildChange(Hs(r,i))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?B.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e){this.indexedFilter_=new ch(e.getIndex()),this.index_=e.getIndex(),this.startPost_=fi.getStartPost_(e),this.endPost_=fi.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,s=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&s}updateChild(e,t,s,r,i,o){return this.matches(new Y(t,s))||(s=B.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,s,r,i,o)}updateFullNode(e,t,s){t.isLeafNode()&&(t=B.EMPTY_NODE);let r=t.withIndex(this.index_);r=r.updatePriority(B.EMPTY_NODE);const i=this;return t.forEachChild(fe,(o,c)=>{i.matches(new Y(o,c))||(r=r.updateImmediateChild(o,B.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,r,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uN{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const s=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?s<=0:s<0},this.withinEndPost=t=>{const s=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?s<=0:s<0},this.rangedFilter_=new fi(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,s,r,i,o){return this.rangedFilter_.matches(new Y(t,s))||(s=B.EMPTY_NODE),e.getImmediateChild(t).equals(s)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,s,r,i,o):this.fullLimitUpdateChild_(e,t,s,i,o)}updateFullNode(e,t,s){let r;if(t.isLeafNode()||t.isEmpty())r=B.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){r=B.EMPTY_NODE.withIndex(this.index_);let i;this.reverse_?i=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):i=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let o=0;for(;i.hasNext()&&o<this.limit_;){const c=i.getNext();if(this.withinDirectionalStart(c))if(this.withinDirectionalEnd(c))r=r.updateImmediateChild(c.name,c.node),o++;else break;else continue}}else{r=t.withIndex(this.index_),r=r.updatePriority(B.EMPTY_NODE);let i;this.reverse_?i=r.getReverseIterator(this.index_):i=r.getIterator(this.index_);let o=0;for(;i.hasNext();){const c=i.getNext();o<this.limit_&&this.withinDirectionalStart(c)&&this.withinDirectionalEnd(c)?o++:r=r.updateImmediateChild(c.name,B.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,r,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,s,r,i){let o;if(this.reverse_){const p=this.index_.getCompare();o=(_,E)=>p(E,_)}else o=this.index_.getCompare();const c=e;D(c.numChildren()===this.limit_,"");const l=new Y(t,s),u=this.reverse_?c.getFirstChild(this.index_):c.getLastChild(this.index_),d=this.rangedFilter_.matches(l);if(c.hasChild(t)){const p=c.getImmediateChild(t);let _=r.getChildAfterChild(this.index_,u,this.reverse_);for(;_!=null&&(_.name===t||c.hasChild(_.name));)_=r.getChildAfterChild(this.index_,_,this.reverse_);const E=_==null?1:o(_,l);if(d&&!s.isEmpty()&&E>=0)return i!=null&&i.trackChildChange(di(t,s,p)),c.updateImmediateChild(t,s);{i!=null&&i.trackChildChange(hi(t,p));const k=c.updateImmediateChild(t,B.EMPTY_NODE);return _!=null&&this.rangedFilter_.matches(_)?(i!=null&&i.trackChildChange(Hs(_.name,_.node)),k.updateImmediateChild(_.name,_.node)):k}}else return s.isEmpty()?e:d&&o(u,l)>=0?(i!=null&&(i.trackChildChange(hi(u.name,u.node)),i.trackChildChange(Hs(t,s))),c.updateImmediateChild(t,s).updateImmediateChild(u.name,B.EMPTY_NODE)):e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lh{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=fe}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return D(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return D(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:Ws}hasEnd(){return this.endSet_}getIndexEndValue(){return D(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return D(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:rs}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return D(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===fe}copy(){const e=new lh;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function hN(n){return n.loadsAllData()?new ch(n.getIndex()):n.hasLimit()?new uN(n):new fi(n)}function Up(n){const e={};if(n.isDefault())return e;let t;if(n.index_===fe?t="$priority":n.index_===cN?t="$value":n.index_===Os?t="$key":(D(n.index_ instanceof oN,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=Ce(t),n.startSet_){const s=n.startAfterSet_?"startAfter":"startAt";e[s]=Ce(n.indexStartValue_),n.startNameSet_&&(e[s]+=","+Ce(n.indexStartName_))}if(n.endSet_){const s=n.endBeforeSet_?"endBefore":"endAt";e[s]=Ce(n.indexEndValue_),n.endNameSet_&&(e[s]+=","+Ce(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function Bp(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==fe&&(e.i=n.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xo extends Gy{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(D(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,s,r){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=s,this.appCheckTokenProvider_=r,this.log_=Oi("p:rest:"),this.listens_={}}listen(e,t,s,r){const i=e._path.toString();this.log_("Listen called for "+i+" "+e._queryIdentifier);const o=Xo.getListenId_(e,s),c={};this.listens_[o]=c;const l=Up(e._queryParams);this.restRequest_(i+".json",l,(u,d)=>{let p=d;if(u===404&&(p=null,u=null),u===null&&this.onDataUpdate_(i,p,!1,s),Jn(this.listens_,o)===c){let _;u?u===401?_="permission_denied":_="rest_error:"+u:_="ok",r(_,null)}})}unlisten(e,t){const s=Xo.getListenId_(e,t);delete this.listens_[s]}get(e){const t=Up(e._queryParams),s=e._path.toString(),r=new Ge;return this.restRequest_(s+".json",t,(i,o)=>{let c=o;i===404&&(c=null,i=null),i===null?(this.onDataUpdate_(s,c,!1,null),r.resolve(c)):r.reject(new Error(c))}),r.promise}refreshAuthToken(e){}restRequest_(e,t={},s){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([r,i])=>{r&&r.accessToken&&(t.auth=r.accessToken),i&&i.token&&(t.ac=i.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+Zs(t);this.log_("Sending REST request for "+o);const c=new XMLHttpRequest;c.onreadystatechange=()=>{if(s&&c.readyState===4){this.log_("REST Response for "+o+" received. status:",c.status,"response:",c.responseText);let l=null;if(c.status>=200&&c.status<300){try{l=Jr(c.responseText)}catch{Je("Failed to parse JSON response for "+o+": "+c.responseText)}s(null,l)}else c.status!==401&&c.status!==404&&Je("Got unsuccessful REST response for "+o+" Status: "+c.status),s(c.status);s=null}},c.open("GET",o,!0),c.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dN{constructor(){this.rootNode_=B.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jo(){return{value:null,children:new Map}}function fr(n,e,t){if(Q(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const s=G(e);n.children.has(s)||n.children.set(s,Jo());const r=n.children.get(s);e=ie(e),fr(r,e,t)}}function Dl(n,e){if(Q(e))return n.value=null,n.children.clear(),!0;if(n.value!==null){if(n.value.isLeafNode())return!1;{const t=n.value;return n.value=null,t.forEachChild(fe,(s,r)=>{fr(n,new se(s),r)}),Dl(n,e)}}else if(n.children.size>0){const t=G(e);return e=ie(e),n.children.has(t)&&Dl(n.children.get(t),e)&&n.children.delete(t),n.children.size===0}else return!0}function Ol(n,e,t){n.value!==null?t(e,n.value):fN(n,(s,r)=>{const i=new se(e.toString()+"/"+s);Ol(r,i,t)})}function fN(n,e){n.children.forEach((t,s)=>{e(s,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pN{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t={...e};return this.last_&&Ve(this.last_,(s,r)=>{t[s]=t[s]-r}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qp=10*1e3,_N=30*1e3,mN=5*60*1e3;class gN{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new pN(e);const s=qp+(_N-qp)*Math.random();Kr(this.reportStats_.bind(this),Math.floor(s))}reportStats_(){const e=this.statsListener_.get(),t={};let s=!1;Ve(e,(r,i)=>{i>0&&Ct(this.statsToReport_,r)&&(t[r]=i,s=!0)}),s&&this.server_.reportStats(t),Kr(this.reportStats_.bind(this),Math.floor(Math.random()*2*mN))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var gt;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(gt||(gt={}));function uh(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function hh(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function dh(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zo{constructor(e,t,s){this.path=e,this.affectedTree=t,this.revert=s,this.type=gt.ACK_USER_WRITE,this.source=uh()}operationForChild(e){if(Q(this.path)){if(this.affectedTree.value!=null)return D(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new se(e));return new Zo(te(),t,this.revert)}}else return D(G(this.path)===e,"operationForChild called for unrelated child."),new Zo(ie(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pi{constructor(e,t){this.source=e,this.path=t,this.type=gt.LISTEN_COMPLETE}operationForChild(e){return Q(this.path)?new pi(this.source,te()):new pi(this.source,ie(this.path))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class is{constructor(e,t,s){this.source=e,this.path=t,this.snap=s,this.type=gt.OVERWRITE}operationForChild(e){return Q(this.path)?new is(this.source,te(),this.snap.getImmediateChild(e)):new is(this.source,ie(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zs{constructor(e,t,s){this.source=e,this.path=t,this.children=s,this.type=gt.MERGE}operationForChild(e){if(Q(this.path)){const t=this.children.subtree(new se(e));return t.isEmpty()?null:t.value?new is(this.source,te(),t.value):new zs(this.source,te(),t)}else return D(G(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new zs(this.source,ie(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dn{constructor(e,t,s){this.node_=e,this.fullyInitialized_=t,this.filtered_=s}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(Q(e))return this.isFullyInitialized()&&!this.filtered_;const t=G(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yN{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function EN(n,e,t,s){const r=[],i=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&i.push(lN(o.childName,o.snapshotNode))}),Vr(n,r,"child_removed",e,s,t),Vr(n,r,"child_added",e,s,t),Vr(n,r,"child_moved",i,s,t),Vr(n,r,"child_changed",e,s,t),Vr(n,r,"value",e,s,t),r}function Vr(n,e,t,s,r,i){const o=s.filter(c=>c.type===t);o.sort((c,l)=>vN(n,c,l)),o.forEach(c=>{const l=TN(n,c,i);r.forEach(u=>{u.respondsTo(c.type)&&e.push(u.createEvent(l,n.query_))})})}function TN(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function vN(n,e,t){if(e.childName==null||t.childName==null)throw Xs("Should only compare child_ events.");const s=new Y(e.childName,e.snapshotNode),r=new Y(t.childName,t.snapshotNode);return n.index_.compare(s,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ga(n,e){return{eventCache:n,serverCache:e}}function Qr(n,e,t,s){return Ga(new Dn(e,t,s),n.serverCache)}function sE(n,e,t,s){return Ga(n.eventCache,new Dn(e,t,s))}function ea(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function os(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Xc;const wN=()=>(Xc||(Xc=new st(ok)),Xc);class ce{static fromObject(e){let t=new ce(null);return Ve(e,(s,r)=>{t=t.set(new se(s),r)}),t}constructor(e,t=wN()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:te(),value:this.value};if(Q(e))return null;{const s=G(e),r=this.children.get(s);if(r!==null){const i=r.findRootMostMatchingPathAndValue(ie(e),t);return i!=null?{path:me(new se(s),i.path),value:i.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(Q(e))return this;{const t=G(e),s=this.children.get(t);return s!==null?s.subtree(ie(e)):new ce(null)}}set(e,t){if(Q(e))return new ce(t,this.children);{const s=G(e),i=(this.children.get(s)||new ce(null)).set(ie(e),t),o=this.children.insert(s,i);return new ce(this.value,o)}}remove(e){if(Q(e))return this.children.isEmpty()?new ce(null):new ce(null,this.children);{const t=G(e),s=this.children.get(t);if(s){const r=s.remove(ie(e));let i;return r.isEmpty()?i=this.children.remove(t):i=this.children.insert(t,r),this.value===null&&i.isEmpty()?new ce(null):new ce(this.value,i)}else return this}}get(e){if(Q(e))return this.value;{const t=G(e),s=this.children.get(t);return s?s.get(ie(e)):null}}setTree(e,t){if(Q(e))return t;{const s=G(e),i=(this.children.get(s)||new ce(null)).setTree(ie(e),t);let o;return i.isEmpty()?o=this.children.remove(s):o=this.children.insert(s,i),new ce(this.value,o)}}fold(e){return this.fold_(te(),e)}fold_(e,t){const s={};return this.children.inorderTraversal((r,i)=>{s[r]=i.fold_(me(e,r),t)}),t(e,this.value,s)}findOnPath(e,t){return this.findOnPath_(e,te(),t)}findOnPath_(e,t,s){const r=this.value?s(t,this.value):!1;if(r)return r;if(Q(e))return null;{const i=G(e),o=this.children.get(i);return o?o.findOnPath_(ie(e),me(t,i),s):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,te(),t)}foreachOnPath_(e,t,s){if(Q(e))return this;{this.value&&s(t,this.value);const r=G(e),i=this.children.get(r);return i?i.foreachOnPath_(ie(e),me(t,r),s):new ce(null)}}foreach(e){this.foreach_(te(),e)}foreach_(e,t){this.children.inorderTraversal((s,r)=>{r.foreach_(me(e,s),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,s)=>{s.value&&e(t,s.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(e){this.writeTree_=e}static empty(){return new vt(new ce(null))}}function Yr(n,e,t){if(Q(e))return new vt(new ce(t));{const s=n.writeTree_.findRootMostValueAndPath(e);if(s!=null){const r=s.path;let i=s.value;const o=Qe(r,e);return i=i.updateChild(o,t),new vt(n.writeTree_.set(r,i))}else{const r=new ce(t),i=n.writeTree_.setTree(e,r);return new vt(i)}}}function xl(n,e,t){let s=n;return Ve(t,(r,i)=>{s=Yr(s,me(e,r),i)}),s}function $p(n,e){if(Q(e))return vt.empty();{const t=n.writeTree_.setTree(e,new ce(null));return new vt(t)}}function Ml(n,e){return fs(n,e)!=null}function fs(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(Qe(t.path,e)):null}function jp(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(fe,(s,r)=>{e.push(new Y(s,r))}):n.writeTree_.children.inorderTraversal((s,r)=>{r.value!=null&&e.push(new Y(s,r.value))}),e}function In(n,e){if(Q(e))return n;{const t=fs(n,e);return t!=null?new vt(new ce(t)):new vt(n.writeTree_.subtree(e))}}function Vl(n){return n.writeTree_.isEmpty()}function Gs(n,e){return rE(te(),n.writeTree_,e)}function rE(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let s=null;return e.children.inorderTraversal((r,i)=>{r===".priority"?(D(i.value!==null,"Priority writes must always be leaf nodes"),s=i.value):t=rE(me(n,r),i,t)}),!t.getChild(n).isEmpty()&&s!==null&&(t=t.updateChild(me(n,".priority"),s)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ka(n,e){return cE(e,n)}function IN(n,e,t,s,r){D(s>n.lastWriteId,"Stacking an older write on top of newer ones"),r===void 0&&(r=!0),n.allWrites.push({path:e,snap:t,writeId:s,visible:r}),r&&(n.visibleWrites=Yr(n.visibleWrites,e,t)),n.lastWriteId=s}function AN(n,e,t,s){D(s>n.lastWriteId,"Stacking an older merge on top of newer ones"),n.allWrites.push({path:e,children:t,writeId:s,visible:!0}),n.visibleWrites=xl(n.visibleWrites,e,t),n.lastWriteId=s}function CN(n,e){for(let t=0;t<n.allWrites.length;t++){const s=n.allWrites[t];if(s.writeId===e)return s}return null}function RN(n,e){const t=n.allWrites.findIndex(c=>c.writeId===e);D(t>=0,"removeWrite called with nonexistent writeId.");const s=n.allWrites[t];n.allWrites.splice(t,1);let r=s.visible,i=!1,o=n.allWrites.length-1;for(;r&&o>=0;){const c=n.allWrites[o];c.visible&&(o>=t&&SN(c,s.path)?r=!1:ht(s.path,c.path)&&(i=!0)),o--}if(r){if(i)return bN(n),!0;if(s.snap)n.visibleWrites=$p(n.visibleWrites,s.path);else{const c=s.children;Ve(c,l=>{n.visibleWrites=$p(n.visibleWrites,me(s.path,l))})}return!0}else return!1}function SN(n,e){if(n.snap)return ht(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&ht(me(n.path,t),e))return!0;return!1}function bN(n){n.visibleWrites=iE(n.allWrites,PN,te()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function PN(n){return n.visible}function iE(n,e,t){let s=vt.empty();for(let r=0;r<n.length;++r){const i=n[r];if(e(i)){const o=i.path;let c;if(i.snap)ht(t,o)?(c=Qe(t,o),s=Yr(s,c,i.snap)):ht(o,t)&&(c=Qe(o,t),s=Yr(s,te(),i.snap.getChild(c)));else if(i.children){if(ht(t,o))c=Qe(t,o),s=xl(s,c,i.children);else if(ht(o,t))if(c=Qe(o,t),Q(c))s=xl(s,te(),i.children);else{const l=Jn(i.children,G(c));if(l){const u=l.getChild(ie(c));s=Yr(s,te(),u)}}}else throw Xs("WriteRecord should have .snap or .children")}}return s}function oE(n,e,t,s,r){if(!s&&!r){const i=fs(n.visibleWrites,e);if(i!=null)return i;{const o=In(n.visibleWrites,e);if(Vl(o))return t;if(t==null&&!Ml(o,te()))return null;{const c=t||B.EMPTY_NODE;return Gs(o,c)}}}else{const i=In(n.visibleWrites,e);if(!r&&Vl(i))return t;if(!r&&t==null&&!Ml(i,te()))return null;{const o=function(u){return(u.visible||r)&&(!s||!~s.indexOf(u.writeId))&&(ht(u.path,e)||ht(e,u.path))},c=iE(n.allWrites,o,e),l=t||B.EMPTY_NODE;return Gs(c,l)}}}function kN(n,e,t){let s=B.EMPTY_NODE;const r=fs(n.visibleWrites,e);if(r)return r.isLeafNode()||r.forEachChild(fe,(i,o)=>{s=s.updateImmediateChild(i,o)}),s;if(t){const i=In(n.visibleWrites,e);return t.forEachChild(fe,(o,c)=>{const l=Gs(In(i,new se(o)),c);s=s.updateImmediateChild(o,l)}),jp(i).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}else{const i=In(n.visibleWrites,e);return jp(i).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}}function NN(n,e,t,s,r){D(s||r,"Either existingEventSnap or existingServerSnap must exist");const i=me(e,t);if(Ml(n.visibleWrites,i))return null;{const o=In(n.visibleWrites,i);return Vl(o)?r.getChild(t):Gs(o,r.getChild(t))}}function DN(n,e,t,s){const r=me(e,t),i=fs(n.visibleWrites,r);if(i!=null)return i;if(s.isCompleteForChild(t)){const o=In(n.visibleWrites,r);return Gs(o,s.getNode().getImmediateChild(t))}else return null}function ON(n,e){return fs(n.visibleWrites,e)}function xN(n,e,t,s,r,i,o){let c;const l=In(n.visibleWrites,e),u=fs(l,te());if(u!=null)c=u;else if(t!=null)c=Gs(l,t);else return[];if(c=c.withIndex(o),!c.isEmpty()&&!c.isLeafNode()){const d=[],p=o.getCompare(),_=i?c.getReverseIteratorFrom(s,o):c.getIteratorFrom(s,o);let E=_.getNext();for(;E&&d.length<r;)p(E,s)!==0&&d.push(E),E=_.getNext();return d}else return[]}function MN(){return{visibleWrites:vt.empty(),allWrites:[],lastWriteId:-1}}function ta(n,e,t,s){return oE(n.writeTree,n.treePath,e,t,s)}function fh(n,e){return kN(n.writeTree,n.treePath,e)}function Wp(n,e,t,s){return NN(n.writeTree,n.treePath,e,t,s)}function na(n,e){return ON(n.writeTree,me(n.treePath,e))}function VN(n,e,t,s,r,i){return xN(n.writeTree,n.treePath,e,t,s,r,i)}function ph(n,e,t){return DN(n.writeTree,n.treePath,e,t)}function aE(n,e){return cE(me(n.treePath,e),n.writeTree)}function cE(n,e){return{treePath:n,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LN{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,s=e.childName;D(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),D(s!==".priority","Only non-priority child changes can be tracked.");const r=this.changeMap.get(s);if(r){const i=r.type;if(t==="child_added"&&i==="child_removed")this.changeMap.set(s,di(s,e.snapshotNode,r.snapshotNode));else if(t==="child_removed"&&i==="child_added")this.changeMap.delete(s);else if(t==="child_removed"&&i==="child_changed")this.changeMap.set(s,hi(s,r.oldSnap));else if(t==="child_changed"&&i==="child_added")this.changeMap.set(s,Hs(s,e.snapshotNode));else if(t==="child_changed"&&i==="child_changed")this.changeMap.set(s,di(s,e.snapshotNode,r.oldSnap));else throw Xs("Illegal combination of changes: "+e+" occurred after "+r)}else this.changeMap.set(s,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FN{getCompleteChild(e){return null}getChildAfterChild(e,t,s){return null}}const lE=new FN;class _h{constructor(e,t,s=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=s}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const s=this.optCompleteServerCache_!=null?new Dn(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return ph(this.writes_,e,s)}}getChildAfterChild(e,t,s){const r=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:os(this.viewCache_),i=VN(this.writes_,r,t,1,s,e);return i.length===0?null:i[0]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function UN(n){return{filter:n}}function BN(n,e){D(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),D(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function qN(n,e,t,s,r){const i=new LN;let o,c;if(t.type===gt.OVERWRITE){const u=t;u.source.fromUser?o=Ll(n,e,u.path,u.snap,s,r,i):(D(u.source.fromServer,"Unknown source."),c=u.source.tagged||e.serverCache.isFiltered()&&!Q(u.path),o=sa(n,e,u.path,u.snap,s,r,c,i))}else if(t.type===gt.MERGE){const u=t;u.source.fromUser?o=jN(n,e,u.path,u.children,s,r,i):(D(u.source.fromServer,"Unknown source."),c=u.source.tagged||e.serverCache.isFiltered(),o=Fl(n,e,u.path,u.children,s,r,c,i))}else if(t.type===gt.ACK_USER_WRITE){const u=t;u.revert?o=zN(n,e,u.path,s,r,i):o=WN(n,e,u.path,u.affectedTree,s,r,i)}else if(t.type===gt.LISTEN_COMPLETE)o=HN(n,e,t.path,s,i);else throw Xs("Unknown operation type: "+t.type);const l=i.getChanges();return $N(e,o,l),{viewCache:o,changes:l}}function $N(n,e,t){const s=e.eventCache;if(s.isFullyInitialized()){const r=s.getNode().isLeafNode()||s.getNode().isEmpty(),i=ea(n);(t.length>0||!n.eventCache.isFullyInitialized()||r&&!s.getNode().equals(i)||!s.getNode().getPriority().equals(i.getPriority()))&&t.push(nE(ea(e)))}}function uE(n,e,t,s,r,i){const o=e.eventCache;if(na(s,t)!=null)return e;{let c,l;if(Q(t))if(D(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const u=os(e),d=u instanceof B?u:B.EMPTY_NODE,p=fh(s,d);c=n.filter.updateFullNode(e.eventCache.getNode(),p,i)}else{const u=ta(s,os(e));c=n.filter.updateFullNode(e.eventCache.getNode(),u,i)}else{const u=G(t);if(u===".priority"){D(Nn(t)===1,"Can't have a priority with additional path components");const d=o.getNode();l=e.serverCache.getNode();const p=Wp(s,t,d,l);p!=null?c=n.filter.updatePriority(d,p):c=o.getNode()}else{const d=ie(t);let p;if(o.isCompleteForChild(u)){l=e.serverCache.getNode();const _=Wp(s,t,o.getNode(),l);_!=null?p=o.getNode().getImmediateChild(u).updateChild(d,_):p=o.getNode().getImmediateChild(u)}else p=ph(s,u,e.serverCache);p!=null?c=n.filter.updateChild(o.getNode(),u,p,d,r,i):c=o.getNode()}}return Qr(e,c,o.isFullyInitialized()||Q(t),n.filter.filtersNodes())}}function sa(n,e,t,s,r,i,o,c){const l=e.serverCache;let u;const d=o?n.filter:n.filter.getIndexedFilter();if(Q(t))u=d.updateFullNode(l.getNode(),s,null);else if(d.filtersNodes()&&!l.isFiltered()){const E=l.getNode().updateChild(t,s);u=d.updateFullNode(l.getNode(),E,null)}else{const E=G(t);if(!l.isCompleteForPath(t)&&Nn(t)>1)return e;const C=ie(t),b=l.getNode().getImmediateChild(E).updateChild(C,s);E===".priority"?u=d.updatePriority(l.getNode(),b):u=d.updateChild(l.getNode(),E,b,C,lE,null)}const p=sE(e,u,l.isFullyInitialized()||Q(t),d.filtersNodes()),_=new _h(r,p,i);return uE(n,p,t,r,_,c)}function Ll(n,e,t,s,r,i,o){const c=e.eventCache;let l,u;const d=new _h(r,e,i);if(Q(t))u=n.filter.updateFullNode(e.eventCache.getNode(),s,o),l=Qr(e,u,!0,n.filter.filtersNodes());else{const p=G(t);if(p===".priority")u=n.filter.updatePriority(e.eventCache.getNode(),s),l=Qr(e,u,c.isFullyInitialized(),c.isFiltered());else{const _=ie(t),E=c.getNode().getImmediateChild(p);let C;if(Q(_))C=s;else{const k=d.getCompleteChild(p);k!=null?rh(_)===".priority"&&k.getChild(Qy(_)).isEmpty()?C=k:C=k.updateChild(_,s):C=B.EMPTY_NODE}if(E.equals(C))l=e;else{const k=n.filter.updateChild(c.getNode(),p,C,_,d,o);l=Qr(e,k,c.isFullyInitialized(),n.filter.filtersNodes())}}}return l}function Hp(n,e){return n.eventCache.isCompleteForChild(e)}function jN(n,e,t,s,r,i,o){let c=e;return s.foreach((l,u)=>{const d=me(t,l);Hp(e,G(d))&&(c=Ll(n,c,d,u,r,i,o))}),s.foreach((l,u)=>{const d=me(t,l);Hp(e,G(d))||(c=Ll(n,c,d,u,r,i,o))}),c}function zp(n,e,t){return t.foreach((s,r)=>{e=e.updateChild(s,r)}),e}function Fl(n,e,t,s,r,i,o,c){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let l=e,u;Q(t)?u=s:u=new ce(null).setTree(t,s);const d=e.serverCache.getNode();return u.children.inorderTraversal((p,_)=>{if(d.hasChild(p)){const E=e.serverCache.getNode().getImmediateChild(p),C=zp(n,E,_);l=sa(n,l,new se(p),C,r,i,o,c)}}),u.children.inorderTraversal((p,_)=>{const E=!e.serverCache.isCompleteForChild(p)&&_.value===null;if(!d.hasChild(p)&&!E){const C=e.serverCache.getNode().getImmediateChild(p),k=zp(n,C,_);l=sa(n,l,new se(p),k,r,i,o,c)}}),l}function WN(n,e,t,s,r,i,o){if(na(r,t)!=null)return e;const c=e.serverCache.isFiltered(),l=e.serverCache;if(s.value!=null){if(Q(t)&&l.isFullyInitialized()||l.isCompleteForPath(t))return sa(n,e,t,l.getNode().getChild(t),r,i,c,o);if(Q(t)){let u=new ce(null);return l.getNode().forEachChild(Os,(d,p)=>{u=u.set(new se(d),p)}),Fl(n,e,t,u,r,i,c,o)}else return e}else{let u=new ce(null);return s.foreach((d,p)=>{const _=me(t,d);l.isCompleteForPath(_)&&(u=u.set(d,l.getNode().getChild(_)))}),Fl(n,e,t,u,r,i,c,o)}}function HN(n,e,t,s,r){const i=e.serverCache,o=sE(e,i.getNode(),i.isFullyInitialized()||Q(t),i.isFiltered());return uE(n,o,t,s,lE,r)}function zN(n,e,t,s,r,i){let o;if(na(s,t)!=null)return e;{const c=new _h(s,e,r),l=e.eventCache.getNode();let u;if(Q(t)||G(t)===".priority"){let d;if(e.serverCache.isFullyInitialized())d=ta(s,os(e));else{const p=e.serverCache.getNode();D(p instanceof B,"serverChildren would be complete if leaf node"),d=fh(s,p)}d=d,u=n.filter.updateFullNode(l,d,i)}else{const d=G(t);let p=ph(s,d,e.serverCache);p==null&&e.serverCache.isCompleteForChild(d)&&(p=l.getImmediateChild(d)),p!=null?u=n.filter.updateChild(l,d,p,ie(t),c,i):e.eventCache.getNode().hasChild(d)?u=n.filter.updateChild(l,d,B.EMPTY_NODE,ie(t),c,i):u=l,u.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=ta(s,os(e)),o.isLeafNode()&&(u=n.filter.updateFullNode(u,o,i)))}return o=e.serverCache.isFullyInitialized()||na(s,te())!=null,Qr(e,u,o,n.filter.filtersNodes())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GN{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const s=this.query_._queryParams,r=new ch(s.getIndex()),i=hN(s);this.processor_=UN(i);const o=t.serverCache,c=t.eventCache,l=r.updateFullNode(B.EMPTY_NODE,o.getNode(),null),u=i.updateFullNode(B.EMPTY_NODE,c.getNode(),null),d=new Dn(l,o.isFullyInitialized(),r.filtersNodes()),p=new Dn(u,c.isFullyInitialized(),i.filtersNodes());this.viewCache_=Ga(p,d),this.eventGenerator_=new yN(this.query_)}get query(){return this.query_}}function KN(n){return n.viewCache_.serverCache.getNode()}function QN(n){return ea(n.viewCache_)}function YN(n,e){const t=os(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!Q(e)&&!t.getImmediateChild(G(e)).isEmpty())?t.getChild(e):null}function Gp(n){return n.eventRegistrations_.length===0}function XN(n,e){n.eventRegistrations_.push(e)}function Kp(n,e,t){const s=[];if(t){D(e==null,"A cancel should cancel all event registrations.");const r=n.query._path;n.eventRegistrations_.forEach(i=>{const o=i.createCancelEvent(t,r);o&&s.push(o)})}if(e){let r=[];for(let i=0;i<n.eventRegistrations_.length;++i){const o=n.eventRegistrations_[i];if(!o.matches(e))r.push(o);else if(e.hasAnyCallback()){r=r.concat(n.eventRegistrations_.slice(i+1));break}}n.eventRegistrations_=r}else n.eventRegistrations_=[];return s}function Qp(n,e,t,s){e.type===gt.MERGE&&e.source.queryId!==null&&(D(os(n.viewCache_),"We should always have a full cache before handling merges"),D(ea(n.viewCache_),"Missing event cache, even though we have a server cache"));const r=n.viewCache_,i=qN(n.processor_,r,e,t,s);return BN(n.processor_,i.viewCache),D(i.viewCache.serverCache.isFullyInitialized()||!r.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=i.viewCache,hE(n,i.changes,i.viewCache.eventCache.getNode(),null)}function JN(n,e){const t=n.viewCache_.eventCache,s=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(fe,(i,o)=>{s.push(Hs(i,o))}),t.isFullyInitialized()&&s.push(nE(t.getNode())),hE(n,s,t.getNode(),e)}function hE(n,e,t,s){const r=s?[s]:n.eventRegistrations_;return EN(n.eventGenerator_,e,t,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ra;class dE{constructor(){this.views=new Map}}function ZN(n){D(!ra,"__referenceConstructor has already been defined"),ra=n}function e0(){return D(ra,"Reference.ts has not been loaded"),ra}function t0(n){return n.views.size===0}function mh(n,e,t,s){const r=e.source.queryId;if(r!==null){const i=n.views.get(r);return D(i!=null,"SyncTree gave us an op for an invalid query."),Qp(i,e,t,s)}else{let i=[];for(const o of n.views.values())i=i.concat(Qp(o,e,t,s));return i}}function fE(n,e,t,s,r){const i=e._queryIdentifier,o=n.views.get(i);if(!o){let c=ta(t,r?s:null),l=!1;c?l=!0:s instanceof B?(c=fh(t,s),l=!1):(c=B.EMPTY_NODE,l=!1);const u=Ga(new Dn(c,l,!1),new Dn(s,r,!1));return new GN(e,u)}return o}function n0(n,e,t,s,r,i){const o=fE(n,e,s,r,i);return n.views.has(e._queryIdentifier)||n.views.set(e._queryIdentifier,o),XN(o,t),JN(o,t)}function s0(n,e,t,s){const r=e._queryIdentifier,i=[];let o=[];const c=On(n);if(r==="default")for(const[l,u]of n.views.entries())o=o.concat(Kp(u,t,s)),Gp(u)&&(n.views.delete(l),u.query._queryParams.loadsAllData()||i.push(u.query));else{const l=n.views.get(r);l&&(o=o.concat(Kp(l,t,s)),Gp(l)&&(n.views.delete(r),l.query._queryParams.loadsAllData()||i.push(l.query)))}return c&&!On(n)&&i.push(new(e0())(e._repo,e._path)),{removed:i,events:o}}function pE(n){const e=[];for(const t of n.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function An(n,e){let t=null;for(const s of n.views.values())t=t||YN(s,e);return t}function _E(n,e){if(e._queryParams.loadsAllData())return Qa(n);{const s=e._queryIdentifier;return n.views.get(s)}}function mE(n,e){return _E(n,e)!=null}function On(n){return Qa(n)!=null}function Qa(n){for(const e of n.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ia;function r0(n){D(!ia,"__referenceConstructor has already been defined"),ia=n}function i0(){return D(ia,"Reference.ts has not been loaded"),ia}let o0=1;class Yp{constructor(e){this.listenProvider_=e,this.syncPointTree_=new ce(null),this.pendingWriteTree_=MN(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function gh(n,e,t,s,r){return IN(n.pendingWriteTree_,e,t,s,r),r?pr(n,new is(uh(),e,t)):[]}function a0(n,e,t,s){AN(n.pendingWriteTree_,e,t,s);const r=ce.fromObject(t);return pr(n,new zs(uh(),e,r))}function pn(n,e,t=!1){const s=CN(n.pendingWriteTree_,e);if(RN(n.pendingWriteTree_,e)){let i=new ce(null);return s.snap!=null?i=i.set(te(),!0):Ve(s.children,o=>{i=i.set(new se(o),!0)}),pr(n,new Zo(s.path,i,t))}else return[]}function Mi(n,e,t){return pr(n,new is(hh(),e,t))}function c0(n,e,t){const s=ce.fromObject(t);return pr(n,new zs(hh(),e,s))}function l0(n,e){return pr(n,new pi(hh(),e))}function u0(n,e,t){const s=yh(n,t);if(s){const r=Eh(s),i=r.path,o=r.queryId,c=Qe(i,e),l=new pi(dh(o),c);return Th(n,i,l)}else return[]}function oa(n,e,t,s,r=!1){const i=e._path,o=n.syncPointTree_.get(i);let c=[];if(o&&(e._queryIdentifier==="default"||mE(o,e))){const l=s0(o,e,t,s);t0(o)&&(n.syncPointTree_=n.syncPointTree_.remove(i));const u=l.removed;if(c=l.events,!r){const d=u.findIndex(_=>_._queryParams.loadsAllData())!==-1,p=n.syncPointTree_.findOnPath(i,(_,E)=>On(E));if(d&&!p){const _=n.syncPointTree_.subtree(i);if(!_.isEmpty()){const E=f0(_);for(let C=0;C<E.length;++C){const k=E[C],b=k.query,V=TE(n,k);n.listenProvider_.startListening(Xr(b),_i(n,b),V.hashFn,V.onComplete)}}}!p&&u.length>0&&!s&&(d?n.listenProvider_.stopListening(Xr(e),null):u.forEach(_=>{const E=n.queryToTagMap.get(Xa(_));n.listenProvider_.stopListening(Xr(_),E)}))}p0(n,u)}return c}function gE(n,e,t,s){const r=yh(n,s);if(r!=null){const i=Eh(r),o=i.path,c=i.queryId,l=Qe(o,e),u=new is(dh(c),l,t);return Th(n,o,u)}else return[]}function h0(n,e,t,s){const r=yh(n,s);if(r){const i=Eh(r),o=i.path,c=i.queryId,l=Qe(o,e),u=ce.fromObject(t),d=new zs(dh(c),l,u);return Th(n,o,d)}else return[]}function Ul(n,e,t,s=!1){const r=e._path;let i=null,o=!1;n.syncPointTree_.foreachOnPath(r,(_,E)=>{const C=Qe(_,r);i=i||An(E,C),o=o||On(E)});let c=n.syncPointTree_.get(r);c?(o=o||On(c),i=i||An(c,te())):(c=new dE,n.syncPointTree_=n.syncPointTree_.set(r,c));let l;i!=null?l=!0:(l=!1,i=B.EMPTY_NODE,n.syncPointTree_.subtree(r).foreachChild((E,C)=>{const k=An(C,te());k&&(i=i.updateImmediateChild(E,k))}));const u=mE(c,e);if(!u&&!e._queryParams.loadsAllData()){const _=Xa(e);D(!n.queryToTagMap.has(_),"View does not exist, but we have a tag");const E=_0();n.queryToTagMap.set(_,E),n.tagToQueryMap.set(E,_)}const d=Ka(n.pendingWriteTree_,r);let p=n0(c,e,t,d,i,l);if(!u&&!o&&!s){const _=_E(c,e);p=p.concat(m0(n,e,_))}return p}function Ya(n,e,t){const r=n.pendingWriteTree_,i=n.syncPointTree_.findOnPath(e,(o,c)=>{const l=Qe(o,e),u=An(c,l);if(u)return u});return oE(r,e,i,t,!0)}function d0(n,e){const t=e._path;let s=null;n.syncPointTree_.foreachOnPath(t,(u,d)=>{const p=Qe(u,t);s=s||An(d,p)});let r=n.syncPointTree_.get(t);r?s=s||An(r,te()):(r=new dE,n.syncPointTree_=n.syncPointTree_.set(t,r));const i=s!=null,o=i?new Dn(s,!0,!1):null,c=Ka(n.pendingWriteTree_,e._path),l=fE(r,e,c,i?o.getNode():B.EMPTY_NODE,i);return QN(l)}function pr(n,e){return yE(e,n.syncPointTree_,null,Ka(n.pendingWriteTree_,te()))}function yE(n,e,t,s){if(Q(n.path))return EE(n,e,t,s);{const r=e.get(te());t==null&&r!=null&&(t=An(r,te()));let i=[];const o=G(n.path),c=n.operationForChild(o),l=e.children.get(o);if(l&&c){const u=t?t.getImmediateChild(o):null,d=aE(s,o);i=i.concat(yE(c,l,u,d))}return r&&(i=i.concat(mh(r,n,s,t))),i}}function EE(n,e,t,s){const r=e.get(te());t==null&&r!=null&&(t=An(r,te()));let i=[];return e.children.inorderTraversal((o,c)=>{const l=t?t.getImmediateChild(o):null,u=aE(s,o),d=n.operationForChild(o);d&&(i=i.concat(EE(d,c,l,u)))}),r&&(i=i.concat(mh(r,n,s,t))),i}function TE(n,e){const t=e.query,s=_i(n,t);return{hashFn:()=>(KN(e)||B.EMPTY_NODE).hash(),onComplete:r=>{if(r==="ok")return s?u0(n,t._path,s):l0(n,t._path);{const i=lk(r,t);return oa(n,t,null,i)}}}}function _i(n,e){const t=Xa(e);return n.queryToTagMap.get(t)}function Xa(n){return n._path.toString()+"$"+n._queryIdentifier}function yh(n,e){return n.tagToQueryMap.get(e)}function Eh(n){const e=n.indexOf("$");return D(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new se(n.substr(0,e))}}function Th(n,e,t){const s=n.syncPointTree_.get(e);D(s,"Missing sync point for query tag that we're tracking");const r=Ka(n.pendingWriteTree_,e);return mh(s,t,r,null)}function f0(n){return n.fold((e,t,s)=>{if(t&&On(t))return[Qa(t)];{let r=[];return t&&(r=pE(t)),Ve(s,(i,o)=>{r=r.concat(o)}),r}})}function Xr(n){return n._queryParams.loadsAllData()&&!n._queryParams.isDefault()?new(i0())(n._repo,n._path):n}function p0(n,e){for(let t=0;t<e.length;++t){const s=e[t];if(!s._queryParams.loadsAllData()){const r=Xa(s),i=n.queryToTagMap.get(r);n.queryToTagMap.delete(r),n.tagToQueryMap.delete(i)}}}function _0(){return o0++}function m0(n,e,t){const s=e._path,r=_i(n,e),i=TE(n,t),o=n.listenProvider_.startListening(Xr(e),r,i.hashFn,i.onComplete),c=n.syncPointTree_.subtree(s);if(r)D(!On(c.value),"If we're adding a query, it shouldn't be shadowed");else{const l=c.fold((u,d,p)=>{if(!Q(u)&&d&&On(d))return[Qa(d).query];{let _=[];return d&&(_=_.concat(pE(d).map(E=>E.query))),Ve(p,(E,C)=>{_=_.concat(C)}),_}});for(let u=0;u<l.length;++u){const d=l[u];n.listenProvider_.stopListening(Xr(d),_i(n,d))}}return o}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vh{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new vh(t)}node(){return this.node_}}class wh{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=me(this.path_,e);return new wh(this.syncTree_,t)}node(){return Ya(this.syncTree_,this.path_)}}const g0=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},Xp=function(n,e,t){if(!n||typeof n!="object")return n;if(D(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return y0(n[".sv"],e,t);if(typeof n[".sv"]=="object")return E0(n[".sv"],e);D(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},y0=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:D(!1,"Unexpected server value: "+n)}},E0=function(n,e,t){n.hasOwnProperty("increment")||D(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const s=n.increment;typeof s!="number"&&D(!1,"Unexpected increment value: "+s);const r=e.node();if(D(r!==null&&typeof r<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!r.isLeafNode())return s;const o=r.getValue();return typeof o!="number"?s:o+s},vE=function(n,e,t,s){return Ah(e,new wh(t,n),s)},Ih=function(n,e,t){return Ah(n,new vh(e),t)};function Ah(n,e,t){const s=n.getPriority().val(),r=Xp(s,e.getImmediateChild(".priority"),t);let i;if(n.isLeafNode()){const o=n,c=Xp(o.getValue(),e,t);return c!==o.getValue()||r!==o.getPriority().val()?new ke(c,_e(r)):n}else{const o=n;return i=o,r!==o.getPriority().val()&&(i=i.updatePriority(new ke(r))),o.forEachChild(fe,(c,l)=>{const u=Ah(l,e.getImmediateChild(c),t);u!==l&&(i=i.updateImmediateChild(c,u))}),i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ch{constructor(e="",t=null,s={children:{},childCount:0}){this.name=e,this.parent=t,this.node=s}}function Ja(n,e){let t=e instanceof se?e:new se(e),s=n,r=G(t);for(;r!==null;){const i=Jn(s.node.children,r)||{children:{},childCount:0};s=new Ch(r,s,i),t=ie(t),r=G(t)}return s}function ps(n){return n.node.value}function Rh(n,e){n.node.value=e,Bl(n)}function wE(n){return n.node.childCount>0}function T0(n){return ps(n)===void 0&&!wE(n)}function Za(n,e){Ve(n.node.children,(t,s)=>{e(new Ch(t,n,s))})}function IE(n,e,t,s){t&&e(n),Za(n,r=>{IE(r,e,!0)})}function v0(n,e,t){let s=n.parent;for(;s!==null;){if(e(s))return!0;s=s.parent}return!1}function Vi(n){return new se(n.parent===null?n.name:Vi(n.parent)+"/"+n.name)}function Bl(n){n.parent!==null&&w0(n.parent,n.name,n)}function w0(n,e,t){const s=T0(t),r=Ct(n.node.children,e);s&&r?(delete n.node.children[e],n.node.childCount--,Bl(n)):!s&&!r&&(n.node.children[e]=t.node,n.node.childCount++,Bl(n))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I0=/[\[\].#$\/\u0000-\u001F\u007F]/,A0=/[\[\].#$\u0000-\u001F\u007F]/,Jc=10*1024*1024,Sh=function(n){return typeof n=="string"&&n.length!==0&&!I0.test(n)},AE=function(n){return typeof n=="string"&&n.length!==0&&!A0.test(n)},C0=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),AE(n)},bh=function(n){return n===null||typeof n=="string"||typeof n=="number"&&!Ha(n)||n&&typeof n=="object"&&Ct(n,".sv")},aa=function(n,e,t,s){s&&e===void 0||Li(xs(n,"value"),e,t)},Li=function(n,e,t){const s=t instanceof se?new jk(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+Gn(s));if(typeof e=="function")throw new Error(n+"contains a function "+Gn(s)+" with contents = "+e.toString());if(Ha(e))throw new Error(n+"contains "+e.toString()+" "+Gn(s));if(typeof e=="string"&&e.length>Jc/3&&fa(e)>Jc)throw new Error(n+"contains a string greater than "+Jc+" utf8 bytes "+Gn(s)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let r=!1,i=!1;if(Ve(e,(o,c)=>{if(o===".value")r=!0;else if(o!==".priority"&&o!==".sv"&&(i=!0,!Sh(o)))throw new Error(n+" contains an invalid key ("+o+") "+Gn(s)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);Wk(s,o),Li(n,c,s),Hk(s)}),r&&i)throw new Error(n+' contains ".value" child '+Gn(s)+" in addition to actual children.")}},R0=function(n,e){let t,s;for(t=0;t<e.length;t++){s=e[t];const i=ui(s);for(let o=0;o<i.length;o++)if(!(i[o]===".priority"&&o===i.length-1)){if(!Sh(i[o]))throw new Error(n+"contains an invalid key ("+i[o]+") in path "+s.toString()+`. Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`)}}e.sort($k);let r=null;for(t=0;t<e.length;t++){if(s=e[t],r!==null&&ht(r,s))throw new Error(n+"contains a path "+r.toString()+" that is ancestor of another path "+s.toString());r=s}},CE=function(n,e,t,s){const r=xs(n,"values");if(!(e&&typeof e=="object")||Array.isArray(e))throw new Error(r+" must be an object containing the children to replace.");const i=[];Ve(e,(o,c)=>{const l=new se(o);if(Li(r,c,me(t,l)),rh(l)===".priority"&&!bh(c))throw new Error(r+"contains an invalid value for '"+l.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");i.push(l)}),R0(r,i)},S0=function(n,e,t){if(Ha(e))throw new Error(xs(n,"priority")+"is "+e.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!bh(e))throw new Error(xs(n,"priority")+"must be a valid Firebase priority (a string, finite number, server value, or null).")},RE=function(n,e,t,s){if(!AE(t))throw new Error(xs(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},b0=function(n,e,t,s){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),RE(n,e,t)},_n=function(n,e){if(G(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},P0=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!Sh(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!C0(t))throw new Error(xs(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class k0{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function ec(n,e){let t=null;for(let s=0;s<e.length;s++){const r=e[s],i=r.getPath();t!==null&&!ih(i,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:i}),t.events.push(r)}t&&n.eventLists_.push(t)}function SE(n,e,t){ec(n,t),bE(n,s=>ih(s,e))}function lt(n,e,t){ec(n,t),bE(n,s=>ht(s,e)||ht(e,s))}function bE(n,e){n.recursionDepth_++;let t=!0;for(let s=0;s<n.eventLists_.length;s++){const r=n.eventLists_[s];if(r){const i=r.path;e(i)?(N0(n.eventLists_[s]),n.eventLists_[s]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function N0(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const s=t.getEventRunner();Gr&&Oe("event: "+t.toString()),dr(s)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D0="repo_interrupt",O0=25;class x0{constructor(e,t,s,r){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=s,this.appCheckProvider_=r,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new k0,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Jo(),this.transactionQueueTree_=new Ch,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function M0(n,e,t){if(n.stats_=nh(n.repoInfo_),n.forceRestClient_||fk())n.server_=new Xo(n.repoInfo_,(s,r,i,o)=>{Jp(n,s,r,i,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>Zp(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{Ce(t)}catch(s){throw new Error("Invalid authOverride provided: "+s)}}n.persistentConnection_=new Ht(n.repoInfo_,e,(s,r,i,o)=>{Jp(n,s,r,i,o)},s=>{Zp(n,s)},s=>{V0(n,s)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(s=>{n.server_.refreshAuthToken(s)}),n.appCheckProvider_.addTokenChangeListener(s=>{n.server_.refreshAppCheckToken(s.token)}),n.statsReporter_=yk(n.repoInfo_,()=>new gN(n.stats_,n.server_)),n.infoData_=new dN,n.infoSyncTree_=new Yp({startListening:(s,r,i,o)=>{let c=[];const l=n.infoData_.getNode(s._path);return l.isEmpty()||(c=Mi(n.infoSyncTree_,s._path,l),setTimeout(()=>{o("ok")},0)),c},stopListening:()=>{}}),Ph(n,"connected",!1),n.serverSyncTree_=new Yp({startListening:(s,r,i,o)=>(n.server_.listen(s,i,r,(c,l)=>{const u=o(c,l);lt(n.eventQueue_,s._path,u)}),[]),stopListening:(s,r)=>{n.server_.unlisten(s,r)}})}function PE(n){const t=n.infoData_.getNode(new se(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function Fi(n){return g0({timestamp:PE(n)})}function Jp(n,e,t,s,r){n.dataUpdateCount++;const i=new se(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(r)if(s){const l=So(t,u=>_e(u));o=h0(n.serverSyncTree_,i,l,r)}else{const l=_e(t);o=gE(n.serverSyncTree_,i,l,r)}else if(s){const l=So(t,u=>_e(u));o=c0(n.serverSyncTree_,i,l)}else{const l=_e(t);o=Mi(n.serverSyncTree_,i,l)}let c=i;o.length>0&&(c=Ks(n,i)),lt(n.eventQueue_,c,o)}function Zp(n,e){Ph(n,"connected",e),e===!1&&B0(n)}function V0(n,e){Ve(e,(t,s)=>{Ph(n,t,s)})}function Ph(n,e,t){const s=new se("/.info/"+e),r=_e(t);n.infoData_.updateSnapshot(s,r);const i=Mi(n.infoSyncTree_,s,r);lt(n.eventQueue_,s,i)}function tc(n){return n.nextWriteId_++}function L0(n,e,t){const s=d0(n.serverSyncTree_,e);return s!=null?Promise.resolve(s):n.server_.get(e).then(r=>{const i=_e(r).withIndex(e._queryParams.getIndex());Ul(n.serverSyncTree_,e,t,!0);let o;if(e._queryParams.loadsAllData())o=Mi(n.serverSyncTree_,e._path,i);else{const c=_i(n.serverSyncTree_,e);o=gE(n.serverSyncTree_,e._path,i,c)}return lt(n.eventQueue_,e._path,o),oa(n.serverSyncTree_,e,t,null,!0),i},r=>(_r(n,"get for query "+Ce(e)+" failed: "+r),Promise.reject(new Error(r))))}function F0(n,e,t,s,r){_r(n,"set",{path:e.toString(),value:t,priority:s});const i=Fi(n),o=_e(t,s),c=Ya(n.serverSyncTree_,e),l=Ih(o,c,i),u=tc(n),d=gh(n.serverSyncTree_,e,l,u,!0);ec(n.eventQueue_,d),n.server_.put(e.toString(),o.val(!0),(_,E)=>{const C=_==="ok";C||Je("set at "+e+" failed: "+_);const k=pn(n.serverSyncTree_,u,!C);lt(n.eventQueue_,e,k),xn(n,r,_,E)});const p=Nh(n,e);Ks(n,p),lt(n.eventQueue_,p,[])}function U0(n,e,t,s){_r(n,"update",{path:e.toString(),value:t});let r=!0;const i=Fi(n),o={};if(Ve(t,(c,l)=>{r=!1,o[c]=vE(me(e,c),_e(l),n.serverSyncTree_,i)}),r)Oe("update() called with empty data.  Don't do anything."),xn(n,s,"ok",void 0);else{const c=tc(n),l=a0(n.serverSyncTree_,e,o,c);ec(n.eventQueue_,l),n.server_.merge(e.toString(),t,(u,d)=>{const p=u==="ok";p||Je("update at "+e+" failed: "+u);const _=pn(n.serverSyncTree_,c,!p),E=_.length>0?Ks(n,e):e;lt(n.eventQueue_,E,_),xn(n,s,u,d)}),Ve(t,u=>{const d=Nh(n,me(e,u));Ks(n,d)}),lt(n.eventQueue_,e,[])}}function B0(n){_r(n,"onDisconnectEvents");const e=Fi(n),t=Jo();Ol(n.onDisconnect_,te(),(r,i)=>{const o=vE(r,i,n.serverSyncTree_,e);fr(t,r,o)});let s=[];Ol(t,te(),(r,i)=>{s=s.concat(Mi(n.serverSyncTree_,r,i));const o=Nh(n,r);Ks(n,o)}),n.onDisconnect_=Jo(),lt(n.eventQueue_,te(),s)}function q0(n,e,t){n.server_.onDisconnectCancel(e.toString(),(s,r)=>{s==="ok"&&Dl(n.onDisconnect_,e),xn(n,t,s,r)})}function e_(n,e,t,s){const r=_e(t);n.server_.onDisconnectPut(e.toString(),r.val(!0),(i,o)=>{i==="ok"&&fr(n.onDisconnect_,e,r),xn(n,s,i,o)})}function $0(n,e,t,s,r){const i=_e(t,s);n.server_.onDisconnectPut(e.toString(),i.val(!0),(o,c)=>{o==="ok"&&fr(n.onDisconnect_,e,i),xn(n,r,o,c)})}function j0(n,e,t,s){if(Ro(t)){Oe("onDisconnect().update() called with empty data.  Don't do anything."),xn(n,s,"ok",void 0);return}n.server_.onDisconnectMerge(e.toString(),t,(r,i)=>{r==="ok"&&Ve(t,(o,c)=>{const l=_e(c);fr(n.onDisconnect_,me(e,o),l)}),xn(n,s,r,i)})}function W0(n,e,t){let s;G(e._path)===".info"?s=Ul(n.infoSyncTree_,e,t):s=Ul(n.serverSyncTree_,e,t),SE(n.eventQueue_,e._path,s)}function ql(n,e,t){let s;G(e._path)===".info"?s=oa(n.infoSyncTree_,e,t):s=oa(n.serverSyncTree_,e,t),SE(n.eventQueue_,e._path,s)}function H0(n){n.persistentConnection_&&n.persistentConnection_.interrupt(D0)}function _r(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),Oe(t,...e)}function xn(n,e,t,s){e&&dr(()=>{if(t==="ok")e(null);else{const r=(t||"error").toUpperCase();let i=r;s&&(i+=": "+s);const o=new Error(i);o.code=r,e(o)}})}function z0(n,e,t,s,r,i){_r(n,"transaction on "+e);const o={path:e,update:t,onComplete:s,status:null,order:Sy(),applyLocally:i,retryCount:0,unwatcher:r,abortReason:null,currentWriteId:null,currentInputSnapshot:null,currentOutputSnapshotRaw:null,currentOutputSnapshotResolved:null},c=kh(n,e,void 0);o.currentInputSnapshot=c;const l=o.update(c.val());if(l===void 0)o.unwatcher(),o.currentOutputSnapshotRaw=null,o.currentOutputSnapshotResolved=null,o.onComplete&&o.onComplete(null,!1,o.currentInputSnapshot);else{Li("transaction failed: Data returned ",l,o.path),o.status=0;const u=Ja(n.transactionQueueTree_,e),d=ps(u)||[];d.push(o),Rh(u,d);let p;typeof l=="object"&&l!==null&&Ct(l,".priority")?(p=Jn(l,".priority"),D(bh(p),"Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")):p=(Ya(n.serverSyncTree_,e)||B.EMPTY_NODE).getPriority().val();const _=Fi(n),E=_e(l,p),C=Ih(E,c,_);o.currentOutputSnapshotRaw=E,o.currentOutputSnapshotResolved=C,o.currentWriteId=tc(n);const k=gh(n.serverSyncTree_,e,C,o.currentWriteId,o.applyLocally);lt(n.eventQueue_,e,k),nc(n,n.transactionQueueTree_)}}function kh(n,e,t){return Ya(n.serverSyncTree_,e,t)||B.EMPTY_NODE}function nc(n,e=n.transactionQueueTree_){if(e||sc(n,e),ps(e)){const t=NE(n,e);D(t.length>0,"Sending zero length transaction queue"),t.every(r=>r.status===0)&&G0(n,Vi(e),t)}else wE(e)&&Za(e,t=>{nc(n,t)})}function G0(n,e,t){const s=t.map(u=>u.currentWriteId),r=kh(n,e,s);let i=r;const o=r.hash();for(let u=0;u<t.length;u++){const d=t[u];D(d.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),d.status=1,d.retryCount++;const p=Qe(e,d.path);i=i.updateChild(p,d.currentOutputSnapshotRaw)}const c=i.val(!0),l=e;n.server_.put(l.toString(),c,u=>{_r(n,"transaction put response",{path:l.toString(),status:u});let d=[];if(u==="ok"){const p=[];for(let _=0;_<t.length;_++)t[_].status=2,d=d.concat(pn(n.serverSyncTree_,t[_].currentWriteId)),t[_].onComplete&&p.push(()=>t[_].onComplete(null,!0,t[_].currentOutputSnapshotResolved)),t[_].unwatcher();sc(n,Ja(n.transactionQueueTree_,e)),nc(n,n.transactionQueueTree_),lt(n.eventQueue_,e,d);for(let _=0;_<p.length;_++)dr(p[_])}else{if(u==="datastale")for(let p=0;p<t.length;p++)t[p].status===3?t[p].status=4:t[p].status=0;else{Je("transaction at "+l.toString()+" failed: "+u);for(let p=0;p<t.length;p++)t[p].status=4,t[p].abortReason=u}Ks(n,e)}},o)}function Ks(n,e){const t=kE(n,e),s=Vi(t),r=NE(n,t);return K0(n,r,s),s}function K0(n,e,t){if(e.length===0)return;const s=[];let r=[];const o=e.filter(c=>c.status===0).map(c=>c.currentWriteId);for(let c=0;c<e.length;c++){const l=e[c],u=Qe(t,l.path);let d=!1,p;if(D(u!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),l.status===4)d=!0,p=l.abortReason,r=r.concat(pn(n.serverSyncTree_,l.currentWriteId,!0));else if(l.status===0)if(l.retryCount>=O0)d=!0,p="maxretry",r=r.concat(pn(n.serverSyncTree_,l.currentWriteId,!0));else{const _=kh(n,l.path,o);l.currentInputSnapshot=_;const E=e[c].update(_.val());if(E!==void 0){Li("transaction failed: Data returned ",E,l.path);let C=_e(E);typeof E=="object"&&E!=null&&Ct(E,".priority")||(C=C.updatePriority(_.getPriority()));const b=l.currentWriteId,V=Fi(n),F=Ih(C,_,V);l.currentOutputSnapshotRaw=C,l.currentOutputSnapshotResolved=F,l.currentWriteId=tc(n),o.splice(o.indexOf(b),1),r=r.concat(gh(n.serverSyncTree_,l.path,F,l.currentWriteId,l.applyLocally)),r=r.concat(pn(n.serverSyncTree_,b,!0))}else d=!0,p="nodata",r=r.concat(pn(n.serverSyncTree_,l.currentWriteId,!0))}lt(n.eventQueue_,t,r),r=[],d&&(e[c].status=2,function(_){setTimeout(_,Math.floor(0))}(e[c].unwatcher),e[c].onComplete&&(p==="nodata"?s.push(()=>e[c].onComplete(null,!1,e[c].currentInputSnapshot)):s.push(()=>e[c].onComplete(new Error(p),!1,null))))}sc(n,n.transactionQueueTree_);for(let c=0;c<s.length;c++)dr(s[c]);nc(n,n.transactionQueueTree_)}function kE(n,e){let t,s=n.transactionQueueTree_;for(t=G(e);t!==null&&ps(s)===void 0;)s=Ja(s,t),e=ie(e),t=G(e);return s}function NE(n,e){const t=[];return DE(n,e,t),t.sort((s,r)=>s.order-r.order),t}function DE(n,e,t){const s=ps(e);if(s)for(let r=0;r<s.length;r++)t.push(s[r]);Za(e,r=>{DE(n,r,t)})}function sc(n,e){const t=ps(e);if(t){let s=0;for(let r=0;r<t.length;r++)t[r].status!==2&&(t[s]=t[r],s++);t.length=s,Rh(e,t.length>0?t:void 0)}Za(e,s=>{sc(n,s)})}function Nh(n,e){const t=Vi(kE(n,e)),s=Ja(n.transactionQueueTree_,e);return v0(s,r=>{Zc(n,r)}),Zc(n,s),IE(s,r=>{Zc(n,r)}),t}function Zc(n,e){const t=ps(e);if(t){const s=[];let r=[],i=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(D(i===o-1,"All SENT items should be at beginning of queue."),i=o,t[o].status=3,t[o].abortReason="set"):(D(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),r=r.concat(pn(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&s.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));i===-1?Rh(e,void 0):t.length=i+1,lt(n.eventQueue_,Vi(e),r);for(let o=0;o<s.length;o++)dr(s[o])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q0(n){let e="";const t=n.split("/");for(let s=0;s<t.length;s++)if(t[s].length>0){let r=t[s];try{r=decodeURIComponent(r.replace(/\+/g," "))}catch{}e+="/"+r}return e}function Y0(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const s=t.split("=");s.length===2?e[decodeURIComponent(s[0])]=decodeURIComponent(s[1]):Je(`Invalid query segment '${t}' in query '${n}'`)}return e}const t_=function(n,e){const t=X0(n),s=t.namespace;t.domain==="firebase.com"&&Xt(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!s||s==="undefined")&&t.domain!=="localhost"&&Xt("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||rk();const r=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new By(t.host,t.secure,s,r,e,"",s!==t.subdomain),path:new se(t.pathString)}},X0=function(n){let e="",t="",s="",r="",i="",o=!0,c="https",l=443;if(typeof n=="string"){let u=n.indexOf("//");u>=0&&(c=n.substring(0,u-1),n=n.substring(u+2));let d=n.indexOf("/");d===-1&&(d=n.length);let p=n.indexOf("?");p===-1&&(p=n.length),e=n.substring(0,Math.min(d,p)),d<p&&(r=Q0(n.substring(d,p)));const _=Y0(n.substring(Math.min(n.length,p)));u=e.indexOf(":"),u>=0?(o=c==="https"||c==="wss",l=parseInt(e.substring(u+1),10)):u=e.length;const E=e.slice(0,u);if(E.toLowerCase()==="localhost")t="localhost";else if(E.split(".").length<=2)t=E;else{const C=e.indexOf(".");s=e.substring(0,C).toLowerCase(),t=e.substring(C+1),i=s}"ns"in _&&(i=_.ns)}return{host:e,port:l,domain:t,subdomain:s,secure:o,scheme:c,pathString:r,namespace:i}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const n_="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",J0=function(){let n=0;const e=[];return function(t){const s=t===n;n=t;let r;const i=new Array(8);for(r=7;r>=0;r--)i[r]=n_.charAt(t%64),t=Math.floor(t/64);D(t===0,"Cannot push at time == 0");let o=i.join("");if(s){for(r=11;r>=0&&e[r]===63;r--)e[r]=0;e[r]++}else for(r=0;r<12;r++)e[r]=Math.floor(Math.random()*64);for(r=0;r<12;r++)o+=n_.charAt(e[r]);return D(o.length===20,"nextPushId: Length should be 20."),o}}();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OE{constructor(e,t,s,r){this.eventType=e,this.eventRegistration=t,this.snapshot=s,this.prevName=r}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+Ce(this.snapshot.exportVal())}}class xE{constructor(e,t,s){this.eventRegistration=e,this.error=t,this.path=s}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dh{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return D(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z0{constructor(e,t){this._repo=e,this._path=t}cancel(){const e=new Ge;return q0(this._repo,this._path,e.wrapCallback(()=>{})),e.promise}remove(){_n("OnDisconnect.remove",this._path);const e=new Ge;return e_(this._repo,this._path,null,e.wrapCallback(()=>{})),e.promise}set(e){_n("OnDisconnect.set",this._path),aa("OnDisconnect.set",e,this._path,!1);const t=new Ge;return e_(this._repo,this._path,e,t.wrapCallback(()=>{})),t.promise}setWithPriority(e,t){_n("OnDisconnect.setWithPriority",this._path),aa("OnDisconnect.setWithPriority",e,this._path,!1),S0("OnDisconnect.setWithPriority",t);const s=new Ge;return $0(this._repo,this._path,e,t,s.wrapCallback(()=>{})),s.promise}update(e){_n("OnDisconnect.update",this._path),CE("OnDisconnect.update",e,this._path);const t=new Ge;return j0(this._repo,this._path,e,t.wrapCallback(()=>{})),t.promise}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oh{constructor(e,t,s,r){this._repo=e,this._path=t,this._queryParams=s,this._orderByCalled=r}get key(){return Q(this._path)?null:rh(this._path)}get ref(){return new St(this._repo,this._path)}get _queryIdentifier(){const e=Bp(this._queryParams),t=eh(e);return t==="{}"?"default":t}get _queryObject(){return Bp(this._queryParams)}isEqual(e){if(e=j(e),!(e instanceof Oh))return!1;const t=this._repo===e._repo,s=ih(this._path,e._path),r=this._queryIdentifier===e._queryIdentifier;return t&&s&&r}toJSON(){return this.toString()}toString(){return this._repo.toString()+qk(this._path)}}class St extends Oh{constructor(e,t){super(e,t,new lh,!1)}get parent(){const e=Qy(this._path);return e===null?null:new St(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class as{constructor(e,t,s){this._node=e,this.ref=t,this._index=s}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new se(e),s=Qs(this.ref,e);return new as(this._node.getChild(t),s,fe)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(s,r)=>e(new as(r,Qs(this.ref,s),fe)))}hasChild(e){const t=new se(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function WD(n,e){return n=j(n),n._checkNotDeleted("ref"),e!==void 0?Qs(n._root,e):n._root}function Qs(n,e){return n=j(n),G(n._path)===null?b0("child","path",e):RE("child","path",e),new St(n._repo,me(n._path,e))}function HD(n){return n=j(n),new Z0(n._repo,n._path)}function zD(n,e){n=j(n),_n("push",n._path),aa("push",e,n._path,!0);const t=PE(n._repo),s=J0(t),r=Qs(n,s),i=Qs(n,s);let o;return e!=null?o=ME(i,e).then(()=>i):o=Promise.resolve(i),r.then=o.then.bind(o),r.catch=o.then.bind(o,void 0),r}function GD(n){return _n("remove",n._path),ME(n,null)}function ME(n,e){n=j(n),_n("set",n._path),aa("set",e,n._path,!1);const t=new Ge;return F0(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}function KD(n,e){CE("update",e,n._path);const t=new Ge;return U0(n._repo,n._path,e,t.wrapCallback(()=>{})),t.promise}function QD(n){n=j(n);const e=new Dh(()=>{}),t=new Ui(e);return L0(n._repo,n,t).then(s=>new as(s,new St(n._repo,n._path),n._queryParams.getIndex()))}class Ui{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const s=t._queryParams.getIndex();return new OE("value",this,new as(e.snapshotNode,new St(t._repo,t._path),s))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new xE(this,e,t):null}matches(e){return e instanceof Ui?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}class rc{constructor(e,t){this.eventType=e,this.callbackContext=t}respondsTo(e){let t=e==="children_added"?"child_added":e;return t=t==="children_removed"?"child_removed":t,this.eventType===t}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new xE(this,e,t):null}createEvent(e,t){D(e.childName!=null,"Child events should have a childName.");const s=Qs(new St(t._repo,t._path),e.childName),r=t._queryParams.getIndex();return new OE(e.type,this,new as(e.snapshotNode,s,r),e.prevName)}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,e.prevName)}matches(e){return e instanceof rc?this.eventType===e.eventType&&(!this.callbackContext||!e.callbackContext||this.callbackContext.matches(e.callbackContext)):!1}hasAnyCallback(){return!!this.callbackContext}}function VE(n,e,t,s,r){let i;if(typeof s=="object"&&(i=void 0,r=s),typeof s=="function"&&(i=s),r&&r.onlyOnce){const l=t,u=(d,p)=>{ql(n._repo,n,c),l(d,p)};u.userCallback=t.userCallback,u.context=t.context,t=u}const o=new Dh(t,i||void 0),c=e==="value"?new Ui(o):new rc(e,o);return W0(n._repo,n,c),()=>ql(n._repo,n,c)}function eD(n,e,t,s){return VE(n,"value",e,t,s)}function YD(n,e,t,s){return VE(n,"child_added",e,t,s)}function XD(n,e,t){let s=null;const r=t?new Dh(t):null;e==="value"?s=new Ui(r):e&&(s=new rc(e,r)),ql(n._repo,n,s)}ZN(St);r0(St);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tD="FIREBASE_DATABASE_EMULATOR_HOST",$l={};let nD=!1;function sD(n,e,t,s){const r=e.lastIndexOf(":"),i=e.substring(0,r),o=ft(i);n.repoInfo_=new By(e,o,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0,t),s&&(n.authTokenProvider_=s)}function rD(n,e,t,s,r){let i=s||n.options.databaseURL;i===void 0&&(n.options.projectId||Xt("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),Oe("Using default host for project ",n.options.projectId),i=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=t_(i,r),c=o.repoInfo,l;typeof process<"u"&&wp&&(l=wp[tD]),l?(i=`http://${l}?ns=${c.namespace}`,o=t_(i,r),c=o.repoInfo):o.repoInfo.secure;const u=new _k(n.name,n.options,e);P0("Invalid Firebase Database URL",o),Q(o.path)||Xt("Database URL must point to the root of a Firebase Database (not including a child path).");const d=oD(c,n,u,new pk(n,t));return new aD(d,n)}function iD(n,e){const t=$l[e];(!t||t[n.key]!==n)&&Xt(`Database ${e}(${n.repoInfo_}) has already been deleted.`),H0(n),delete t[n.key]}function oD(n,e,t,s){let r=$l[e.name];r||(r={},$l[e.name]=r);let i=r[n.toURLString()];return i&&Xt("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),i=new x0(n,nD,t,s),r[n.toURLString()]=i,i}class aD{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(M0(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new St(this._repo,te())),this._rootInternal}_delete(){return this._rootInternal!==null&&(iD(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&Xt("Cannot call "+e+" on a deleted database.")}}function JD(n=er(),e){const t=Mn(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const s=da("database");s&&cD(t,...s)}return t}function cD(n,e,t,s={}){n=j(n),n._checkNotDeleted("useEmulator");const r=`${e}:${t}`,i=n._repoInternal;if(n._instanceStarted){if(r===n._repoInternal.repoInfo_.host&&zt(s,i.repoInfo_.emulatorOptions))return;Xt("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let o;if(i.repoInfo_.nodeAdmin)s.mockUserToken&&Xt('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),o=new Io(Io.OWNER);else if(s.mockUserToken){const c=typeof s.mockUserToken=="string"?s.mockUserToken:Wl(s.mockUserToken,n.app.options.projectId);o=new Io(c)}ft(e)&&(mi(e),gi("Database",!0)),sD(i,r,s,o)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lD(n){ZP(Vn),wt(new dt("database",(e,{instanceIdentifier:t})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("auth-internal"),i=e.getProvider("app-check-internal");return rD(s,r,i,t)},"PUBLIC").setMultipleInstances(!0)),Ye(Ip,Ap,n),Ye(Ip,Ap,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uD={".sv":"timestamp"};function ZD(){return uD}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hD{constructor(e,t){this.committed=e,this.snapshot=t}toJSON(){return{committed:this.committed,snapshot:this.snapshot.toJSON()}}}function eO(n,e,t){if(n=j(n),_n("Reference.transaction",n._path),n.key===".length"||n.key===".keys")throw"Reference.transaction failed: "+n.key+" is a read-only object.";const s=!0,r=new Ge,i=(c,l,u)=>{let d=null;c?r.reject(c):(d=new as(u,new St(n._repo,n._path),fe),r.resolve(new hD(l,d)))},o=eD(n,()=>{});return z0(n._repo,n._path,e,i,o,s),r.promise}Ht.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};Ht.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};lD();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dD="type.googleapis.com/google.protobuf.Int64Value",fD="type.googleapis.com/google.protobuf.UInt64Value";function LE(n,e){const t={};for(const s in n)n.hasOwnProperty(s)&&(t[s]=e(n[s]));return t}function ca(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>ca(e));if(typeof n=="function"||typeof n=="object")return LE(n,e=>ca(e));throw new Error("Data cannot be encoded in JSON: "+n)}function Ys(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case dD:case fD:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>Ys(e)):typeof n=="function"||typeof n=="object"?LE(n,e=>Ys(e)):n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xh="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s_={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class rt extends At{constructor(e,t,s){super(`${xh}/${e}`,t||""),this.details=s,Object.setPrototypeOf(this,rt.prototype)}}function pD(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function la(n,e){let t=pD(n),s=t,r;try{const i=e&&e.error;if(i){const o=i.status;if(typeof o=="string"){if(!s_[o])return new rt("internal","internal");t=s_[o],s=o}const c=i.message;typeof c=="string"&&(s=c),r=i.details,r!==void 0&&(r=Ys(r))}}catch{}return t==="ok"?null:new rt(t,s,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _D{constructor(e,t,s,r){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,Ke(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=t.getImmediate({optional:!0}),this.messaging=s.getImmediate({optional:!0}),this.auth||t.get().then(i=>this.auth=i,()=>{}),this.messaging||s.get().then(i=>this.messaging=i,()=>{}),this.appCheck||r==null||r.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),s=await this.getMessagingToken(),r=await this.getAppCheckToken(e);return{authToken:t,messagingToken:s,appCheckToken:r}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jl="us-central1",mD=/^data: (.*?)(?:\n|$)/;function gD(n){let e=null;return{promise:new Promise((t,s)=>{e=setTimeout(()=>{s(new rt("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}class yD{constructor(e,t,s,r,i=jl,o=(...c)=>fetch(...c)){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new _D(e,t,s,r),this.cancelAllRequests=new Promise(c=>{this.deleteService=()=>Promise.resolve(c())});try{const c=new URL(i);this.customDomain=c.origin+(c.pathname==="/"?"":c.pathname),this.region=jl}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}function ED(n,e,t){const s=ft(e);n.emulatorOrigin=`http${s?"s":""}://${e}:${t}`,s&&(mi(n.emulatorOrigin+"/backends"),gi("Functions",!0))}function TD(n,e,t){const s=r=>wD(n,e,r,t||{});return s.stream=(r,i)=>AD(n,e,r,i),s}function FE(n){return n.emulatorOrigin&&ft(n.emulatorOrigin)?"include":void 0}async function vD(n,e,t,s,r){t["Content-Type"]="application/json";let i;try{i=await s(n,{method:"POST",body:JSON.stringify(e),headers:t,credentials:FE(r)})}catch{return{status:0,json:null}}let o=null;try{o=await i.json()}catch{}return{status:i.status,json:o}}async function UE(n,e){const t={},s=await n.contextProvider.getContext(e.limitedUseAppCheckTokens);return s.authToken&&(t.Authorization="Bearer "+s.authToken),s.messagingToken&&(t["Firebase-Instance-ID-Token"]=s.messagingToken),s.appCheckToken!==null&&(t["X-Firebase-AppCheck"]=s.appCheckToken),t}function wD(n,e,t,s){const r=n._url(e);return ID(n,r,t,s)}async function ID(n,e,t,s){t=ca(t);const r={data:t},i=await UE(n,s),o=s.timeout||7e4,c=gD(o),l=await Promise.race([vD(e,r,i,n.fetchImpl,n),c.promise,n.cancelAllRequests]);if(c.cancel(),!l)throw new rt("cancelled","Firebase Functions instance was deleted.");const u=la(l.status,l.json);if(u)throw u;if(!l.json)throw new rt("internal","Response is not valid JSON object.");let d=l.json.data;if(typeof d>"u"&&(d=l.json.result),typeof d>"u")throw new rt("internal","Response is missing data field.");return{data:Ys(d)}}function AD(n,e,t,s){const r=n._url(e);return CD(n,r,t,s||{})}async function CD(n,e,t,s){var _;t=ca(t);const r={data:t},i=await UE(n,s);i["Content-Type"]="application/json",i.Accept="text/event-stream";let o;try{o=await n.fetchImpl(e,{method:"POST",body:JSON.stringify(r),headers:i,signal:s==null?void 0:s.signal,credentials:FE(n)})}catch(E){if(E instanceof Error&&E.name==="AbortError"){const k=new rt("cancelled","Request was cancelled.");return{data:Promise.reject(k),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(k)}}}}}}const C=la(0,null);return{data:Promise.reject(C),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(C)}}}}}}let c,l;const u=new Promise((E,C)=>{c=E,l=C});(_=s==null?void 0:s.signal)==null||_.addEventListener("abort",()=>{const E=new rt("cancelled","Request was cancelled.");l(E)});const d=o.body.getReader(),p=RD(d,c,l,s==null?void 0:s.signal);return{stream:{[Symbol.asyncIterator](){const E=p.getReader();return{async next(){const{value:C,done:k}=await E.read();return{value:C,done:k}},async return(){return await E.cancel(),{done:!0,value:void 0}}}}},data:u}}function RD(n,e,t,s){const r=(o,c)=>{const l=o.match(mD);if(!l)return;const u=l[1];try{const d=JSON.parse(u);if("result"in d){e(Ys(d.result));return}if("message"in d){c.enqueue(Ys(d.message));return}if("error"in d){const p=la(0,d);c.error(p),t(p);return}}catch(d){if(d instanceof rt){c.error(d),t(d);return}}},i=new TextDecoder;return new ReadableStream({start(o){let c="";return l();async function l(){if(s!=null&&s.aborted){const u=new rt("cancelled","Request was cancelled");return o.error(u),t(u),Promise.resolve()}try{const{value:u,done:d}=await n.read();if(d){c.trim()&&r(c.trim(),o),o.close();return}if(s!=null&&s.aborted){const _=new rt("cancelled","Request was cancelled");o.error(_),t(_),await n.cancel();return}c+=i.decode(u,{stream:!0});const p=c.split(`
`);c=p.pop()||"";for(const _ of p)_.trim()&&r(_.trim(),o);return l()}catch(u){const d=u instanceof rt?u:la(0,null);o.error(d),t(d)}}},cancel(){return n.cancel()}})}const r_="@firebase/functions",i_="0.13.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SD="auth-internal",bD="app-check-internal",PD="messaging-internal";function kD(n){const e=(t,{instanceIdentifier:s})=>{const r=t.getProvider("app").getImmediate(),i=t.getProvider(SD),o=t.getProvider(PD),c=t.getProvider(bD);return new yD(r,i,o,c,s)};wt(new dt(xh,e,"PUBLIC").setMultipleInstances(!0)),Ye(r_,i_,n),Ye(r_,i_,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tO(n=er(),e=jl){const s=Mn(j(n),xh).getImmediate({identifier:e}),r=da("functions");return r&&ND(s,...r),s}function ND(n,e,t){ED(j(n),e,t)}function nO(n,e,t){return TD(j(n),e,t)}kD();export{pb as $,ib as A,nO as B,tO as C,zP as D,LP as E,WP as F,cn as G,db as H,fb as I,HP as J,lb as K,WD as L,QD as M,eD as N,XD as O,KD as P,GD as Q,dm as R,zD as S,le as T,YD as U,ME as V,eO as W,ZD as X,eb as Y,mb as Z,jP as _,UD as a,HD as a0,$D as a1,jD as a2,$S as b,KP as c,JD as d,Vg as e,rb as f,FD as g,xD as h,Kv as i,DD as j,LD as k,MD as l,VD as m,sb as n,OD as o,_b as p,ub as q,cb as r,ob as s,hb as t,ab as u,qS as v,YS as w,XS as x,JS as y,ZS as z};
