import {moreNativeChallenges} from './more-native-challenges.js';
import {tri as T} from './i18n.js';
const cases=[{stdin:'4\n1 2 3 4\n',expected:'6'},{stdin:'0\n',expected:'0'},{stdin:'4\n-2 0 4 3\n',expected:'2'}];
const solutions={
c:`#include <stdio.h>

int main(void) {
  int count, number;
  long long total = 0;
  scanf("%d", &count);
  for (int i = 0; i < count; i++) {
    scanf("%d", &number);
    if (number % 2 == 0) {
      total += number;
    }
  }
  printf("%lld\\n", total);
  return 0;
}`,
cpp:`#include <iostream>

int main() {
  int count, number;
  long long total = 0;
  std::cin >> count;
  for (int i = 0; i < count; i++) {
    std::cin >> number;
    if (number % 2 == 0) {
      total += number;
    }
  }
  std::cout << total << "\\n";
  return 0;
}`,
python:`import sys

values = list(map(int, sys.stdin.read().split()))
count = values[0]
total = 0
for number in values[1:count + 1]:
    if number % 2 == 0:
        total += number
print(total)`
};
export const nativeChallenges=[...moreNativeChallenges,...Object.entries(solutions).map(([language,solution])=>({
 id:language+'-sum-even',language,solution,
 title:T('Sum even numbers · '+language,'累加偶数 · '+({c:'C',cpp:'C++',python:'Python'}[language]),'累加偶數 · '+({c:'C',cpp:'C++',python:'Python'}[language])),
 brief:T('Read n (0–100), then n integers (−1000 to 1000). Print the sum of the even values. Empty input lists sum to 0.','从标准输入读取 n（0–100），再读取 n 个整数（−1000 到 1000），输出所有偶数的和；n 为 0 时输出 0。','從標準輸入讀取 n（0–100），再讀取 n 個整數（−1000 到 1000），輸出所有偶數的和；n 為 0 時輸出 0。'),
 starter:language==='python'?'# Read input and print the answer.\n':language==='c'?'#include <stdio.h>\n\nint main(void) {\n  // Read input and print the answer.\n  return 0;\n}\n':'#include <iostream>\n\nint main() {\n  // Read input and print the answer.\n  return 0;\n}\n',
 tests:cases.map((x,i)=>({...x,name:T('Case '+(i+1),'用例 '+(i+1),'案例 '+(i+1))}))
}))];
export async function checkNativeChallenge(runner,challenge,code,onProgress=()=>{}){
 const results=[];
 for(const test of challenge.tests){
  const result=await runner.run(challenge.language,code,test.stdin,{onProgress});
  const actual=(result.logs||[]).join('\n').replace(/\r\n/g,'\n').trim();
  results.push({pass:!result.error&&actual===test.expected,actual,expected:test.expected,error:result.error});
  if(result.error)break;
 }
 return {results};
}
