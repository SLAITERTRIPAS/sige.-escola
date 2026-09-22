with open('src/views/PedagogicalDashboard.tsx', 'r') as f:
    c = f.read()

# Fix the missing parenthesis from the script replace:
c = c.replace('                      </div>\n          </div>\n        )}\n        {activeTab === \'docentes\' && (', '                      </div>\n          </div>\n        )}\n        {activeTab === \'docentes\' && (')
