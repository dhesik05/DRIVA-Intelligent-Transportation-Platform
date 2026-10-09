import os, glob, re

target_dir = r'd:\DRIVA\frontend\src\components\navigation'
for filepath in glob.glob(os.path.join(target_dir, '*Sidebar.tsx')):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace to='/something?tab=other' with to='/something/other'
    new_content = re.sub(r'to="([^?"]+)\?tab=([^?"]+)"', r'to="\1/\2"', content)
    
    # Also replace navigate('/admin?tab=health')
    new_content = new_content.replace("navigate('/admin?tab=health')", "navigate('/admin/health')")
    
    # Revert settings/account to settings?tab=account if accidentally changed
    new_content = new_content.replace('to="/settings/account"', 'to="/settings?tab=account"')
    new_content = new_content.replace('to="/settings/notifications"', 'to="/settings?tab=notifications"')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
print('Done!')
