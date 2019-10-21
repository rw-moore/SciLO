import subprocess

if __name__ == "__main__":
    a = subprocess.run("sage /Users/haotianzhu/Desktop/SciLO/polls/script/1.py", shell=True, check=True)
    print(a.stdout)
    # p = subprocess.Popen(['sage'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, shell=True)
    # result,_ = p.communicate(input='print(1)'.encode('utf-8'))
    # print(result.decode('utf-8'), 'I amher')
