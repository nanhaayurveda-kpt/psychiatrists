import sys

with open('app/doctor/[id]/PrescriptionForm.js', 'r', encoding='utf-8') as f:
    pf = f.read()

# corrupt lines हटाओ
while pf.count('const [frequentMeds, setFrequentMeds] = useState({});') > 1:
    pf = pf.replace(
        '  const [frequentMeds, setFrequentMeds] = useState({});\n  const [frequentMeds, setFrequentMeds] = useState({});',
        '  const [frequentMeds, setFrequentMeds] = useState({});'
    )

while pf.count('{/* Frequent Medicines */}') > 1:
    idx = pf.find('{/* Frequent Medicines */}')
    idx2 = pf.find('{/* Frequent Medicines */}', idx + 1)
    pf = pf[:idx] + pf[idx2:]

pf = pf.replace('    } catch: pass', '    } catch (e) { /* ignore */ }')

with open('app/doctor/[id]/PrescriptionForm.js', 'w', encoding='utf-8') as f:
    f.write(pf)

print('done - lines:', pf.count('\n'))
print('frequentMeds count:', pf.count('const [frequentMeds'))
print('Quick Add count:', pf.count('Quick Add'))