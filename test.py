# import os
# print('starting pylint')
# out = os.system('pylint polls > pylintout.txt')
# print('pylint finished with {}'.format(out))

class A:
	# b=2
	print('out side init')
	def __init__(self):
		print('inside A', self.b)


class B(A):
	b = 1
	print('out side init')
	# def __init__(self):
	# 	super().__init__()
class C(A):
	b = 3
	print('out side init')	
b = B()
c = C()