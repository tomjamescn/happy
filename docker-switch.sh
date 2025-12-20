#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DOCKER_COMPOSE_FILE="docker-compose.yml"

# 显示帮助信息
show_help() {
    echo "用法: ./docker-switch.sh [dev|prod]"
    echo ""
    echo "选项:"
    echo "  dev   - 切换到开发模式（使用 build）"
    echo "  prod  - 切换到生产模式（使用 image）"
    echo ""
    echo "示例:"
    echo "  ./docker-switch.sh dev"
    echo "  ./docker-switch.sh prod"
}

# 切换到开发模式
switch_to_dev() {
    echo -e "${YELLOW}切换到开发模式...${NC}"

    # 注释掉 image 行，取消注释 build 行
    sed -i.bak \
        -e 's/^[[:space:]]*image:/#image:/' \
        -e 's/^[[:space:]]*#build:/    build:/' \
        "$DOCKER_COMPOSE_FILE"

    echo -e "${GREEN}✓ 已切换到开发模式（使用 build）${NC}"
    echo ""
    show_current_config
}

# 切换到生产模式
switch_to_prod() {
    echo -e "${YELLOW}切换到生产模式...${NC}"

    # 注释掉 build 行，取消注释 image 行
    sed -i.bak \
        -e 's/^[[:space:]]*build:/#build:/' \
        -e 's/^[[:space:]]*#image:/    image:/' \
        "$DOCKER_COMPOSE_FILE"

    echo -e "${GREEN}✓ 已切换到生产模式（使用 image）${NC}"
    echo ""
    show_current_config
}

# 显示当前配置
show_current_config() {
    echo "当前配置:"
    echo "---"
    grep -A 1 "happy-app:" "$DOCKER_COMPOSE_FILE" | tail -n 2
    echo "---"
}

# 主逻辑
main() {
    # 检查 docker-compose.yml 是否存在
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        echo -e "${RED}错误: 找不到 $DOCKER_COMPOSE_FILE 文件${NC}"
        exit 1
    fi

    # 检查参数
    if [ $# -eq 0 ]; then
        echo -e "${RED}错误: 请指定模式（dev 或 prod）${NC}"
        echo ""
        show_help
        exit 1
    fi

    case "$1" in
        dev)
            switch_to_dev
            ;;
        prod)
            switch_to_prod
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo -e "${RED}错误: 未知选项 '$1'${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
