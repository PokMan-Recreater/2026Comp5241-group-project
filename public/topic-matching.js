// Catalog routing hints, not a claim that each alias has a dedicated course.
export const topicKeywords={
 development:['software','development','workflow','软件','軟體','开发','開發'],
 requirements:['requirement','stakeholder','user research','需求','访谈','訪談'],
 architecture:['react','typescript','frontend','front end','next.js','web app','web','security','architecture','api','rest','backend','http','server','endpoint','graphql','owasp','auth','encryption','privacy','网页','網頁','权限','權限','安全','接口','介面'],
 'ai-coding':['ai coding','copilot','ai assistant','agent','ai编程','ai程式'],
 'testing-release':['test','testing','tdd','qa','quality','debug','regression','测试','測試','上线','上線'],
 'product-decisions':['product','team','scope','agile','scrum','sprint','standup','jira','collaboration','project management','产品','產品','团队','團隊','范围','範圍','敏捷'],
 'python-first-steps':['python','csv','automation','pandas','numpy','notebook','jupyter','scripting','文件处理','檔案處理'],
 career:['career','job','interview','star','story bank','resume','cv','behavioural','behavioral','hiring','recruit','portfolio','面试','面試','求职','求職','简历','履歷'],
 'ai-toolkit':['ai','artificial intelligence','chatgpt','generative ai','ai literacy','ai tool','non-cs','ux','design','figma','accessibility','a11y','prototyping','人工智能','人工智慧','ai工具'],
 'git-essentials':['git','github','version control','branch','commit','merge','pull request','code review','版本控制','分支','合并','合併'],
 'data-sql':['sql','database','select','join','query','queries','data analysis','analytics','dashboard','table','excel','reporting','数据查询','資料查詢','数据库','資料庫'],
 'docker-containers':['docker','container','compose','kubernetes','k8s','devops','容器','镜像','映像'],
 'cicd-pipelines':['ci','cd','ci/cd','cicd','continuous integration','pipeline','github actions','vercel','deploy','deployment','release','hosting','cloud','aws','azure','gcp','serverless','infrastructure','terraform','流水线','流水線','部署','云计算','雲端'],
 'prompt-engineering':['prompt','prompting','prompt engineering','system message','few-shot','提示词','提示詞'],
 'llm-apps':['llm','gpt','rag','retrieval','embedding','vector','chatbot','openai','fine-tuning','language model','大模型','检索','檢索'],
 'ml-foundations':['ml','machine learning','gradient','overfit','model training','neural','deep learning','regression','classification','data science','prediction','机器学习','機器學習','梯度','过拟合','過度擬合'],
};
export function hasTopicKeyword(query,keyword){
 const q=String(query).toLowerCase(),k=keyword.toLowerCase();
 if(/[\u3400-\u9fff]/.test(k))return q.includes(k);
 const escaped=k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 // Plurals are useful aliases; short abbreviations must not match inside words.
 return new RegExp('(?:^|[^a-z0-9])'+escaped+(k.length>3?'(?:s|es)?':'')+'(?=$|[^a-z0-9])','i').test(q);
}
