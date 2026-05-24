#!/bin/bash

# 脚本配置
JAVA='/www/server/java/jdk-17.0.8/bin/java'
JAR_NAME="api-server.jar"  # 替换为你的jar包名称
JAR_PATH="."  # 替换为你的jar包路径
JAVA_OPTS="-Xms512m -Xmx1024m"  # Java虚拟机参数，可根据需要调整
SPRING_PROFILES_ACTIVE="test"  # Spring Boot激活的环境配置
PID_FILE="/tmp/${JAR_NAME}.pid"  # PID文件存储位置

# 函数：检查应用是否正在运行
is_running() {
    if [ -f "${PID_FILE}" ]; then
        PID=$(cat "${PID_FILE}")
        if ps -p "${PID}" > /dev/null 2>&1; then
            return 0  # 正在运行
        else
            rm -f "${PID_FILE}"
            return 1  # 进程不存在但PID文件存在
        fi
    else
        return 1  # 未运行
    fi
}

# 函数：启动应用
start() {
    if is_running; then
        echo "应用已经在运行中 (PID: $(cat ${PID_FILE}))"
        exit 1
    fi

    echo "正在启动应用，环境: ${SPRING_PROFILES_ACTIVE}..."
    cd "${JAR_PATH}" || exit 1
    
    nohup $JAVA ${JAVA_OPTS} -javaagent:"${JAR_NAME}" -jar "${JAR_NAME}" \
        --spring.profiles.active=${SPRING_PROFILES_ACTIVE} > /dev/null 2>&1 &
    PID=$!
    
    # 等待一段时间确保进程启动成功
    sleep 2
    
    # 再次确认进程是否还在运行
    if ps -p "${PID}" > /dev/null 2>&1; then
        echo "${PID}" > "${PID_FILE}"
        echo "应用已启动 (PID: ${PID},  环境: ${SPRING_PROFILES_ACTIVE})"
    else
        echo "启动失败"
        exit 1
    fi
}

# 函数：停止应用
stop() {
    if ! is_running; then
        echo "应用未运行"
        exit 0
    fi

    PID=$(cat "${PID_FILE}")
    echo "正在停止应用 (PID: ${PID})..."

    # 尝试优雅关闭
    kill -TERM "${PID}"
    
    # 等待进程结束
    COUNT=0
    while ps -p "${PID}" > /dev/null 2>&1 && [ $COUNT -lt 30 ]; do
        sleep 1
        COUNT=$((COUNT+1))
    done
    
    # 如果进程仍在运行，强制终止
    if ps -p "${PID}" > /dev/null 2>&1; then
        echo "优雅关闭超时，执行强制终止..."
        kill -KILL "${PID}"
        
        # 再次等待确认进程已结束
        COUNT=0
        while ps -p "${PID}" > /dev/null 2>&1 && [ $COUNT -lt 10 ]; do
            sleep 1
            COUNT=$((COUNT+1))
        done
    fi
    
    if ps -p "${PID}" > /dev/null 2>&1; then
        echo "无法终止进程 ${PID}"
        exit 1
    else
        rm -f "${PID_FILE}"
        echo "应用已停止"
    fi
}

# 函数：重启应用
restart() {
    if is_running; then
        echo "正在重启应用..."
        stop
    fi
    start
}

# 函数：查看状态
status() {
    if is_running; then
        PID=$(cat "${PID_FILE}")
        echo "应用正在运行 (PID: ${PID},  环境: ${SPRING_PROFILES_ACTIVE})"
        # 显示一些进程信息
        ps -o pid,ppid,cmd,etime,pcpu,pmem -p "${PID}" 2>/dev/null
    else
        echo "应用未运行"
    fi
}

# 函数：显示帮助信息
show_help() {
    echo "用法: $0 {start|stop|restart|status|help}"
    echo ""
    echo "命令说明:"
    echo "  start   - 启动应用"
    echo "  stop    - 停止应用"
    echo "  restart - 重启应用"
    echo "  status  - 查看应用状态"
    echo "  help    - 显示此帮助信息"
    echo ""
    echo "配置信息:"
    echo "  JAR包路径: ${JAR_PATH}/${JAR_NAME}"
    echo "  PID文件: ${PID_FILE}"
    echo "  环境配置: ${SPRING_PROFILES_ACTIVE}"
    echo "  JVM参数: ${JAVA_OPTS}"
}

# 主程序
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    help)
        show_help
        ;;
    *)
        echo "无效参数: $1"
        echo "使用 '$0 help' 查看可用命令"
        exit 1
        ;;
esac

exit 0
