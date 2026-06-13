with open('app/doctor/[id]/PrescriptionForm.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('    } catch: pass', '    } catch (e) { /* ignore */ }')

with open('app/doctor/[id]/PrescriptionForm.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('done')