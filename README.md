# danmakulabv2

# [点我进入实验室](/dist/).

mfuns 高级弹幕实验室 v2 版

采用 vue 重构

# 更新日志

# 2021/8/28 2.0 发布

# 2021/8/29 2.1 发布
现在弹幕格式错误会出现提示了

# 2021/10/11 支持docker一键部署

部署方法：
```shell 
# 拉取git仓库
git clone git@github.com:Mfuns-cn/danmakulabv2.git 

# 构建镜像
sudo docker build -t labv2 .

# 运行镜像
sudo docker run -d -p 8080:80 labv2
```

然后就可以访问 http://ip地址:8080 使用了