# stdlib
from pathlib import Path

# thirdparty
import matplotlib.pyplot as plt
import numpy as np

# Конфигурация API и инфраструктуры
config = {
    "apis": [
        {
            "name": "OpenAI",
            "base_cost_per_token": 0.0001,
            "discounts": [
                (1_000_000, 1.0),
                (5_000_000, 0.9),
                (10_000_000, 0.8),
            ],
        },
        {
            "name": "Custom API 1",
            "base_cost_per_token": 0.00015,
            "discounts": [
                (1_000_000, 1.0),
                (5_000_000, 0.92),
                (10_000_000, 0.85),
            ],
        },
        {
            "name": "Custom API 2",
            "base_cost_per_token": 0.00005,
            "discounts": [
                (1_000_000, 1.0),
                (5_000_000, 0.95),
                (10_000_000, 0.9),
            ],
        },
    ],
    "api_config": {"tokens_per_request": 5},
    "cloud": {
        "name": "AWS CPU instance",
        "cost_per_instance": 410,
        "requests_per_instance": 2_000_000,
    },
    "server": {
        "name": "Свой сервер (CPU)",
        "cost_per_server": 288,
        "support_cost_per_server": 150,
        "additional_costs_factor": 1.2,
        "requests_per_server": 5_000_000,
    },
    "gpu": {
        "name": "AWS GPU instance",
        "cost_per_instance": 1200,
        "requests_per_instance": 7_000_000,
    },
    "gpu_server": {
        "name": "Свой сервер (GPU)",
        "cost_per_server": 2000,
        "support_cost_per_server": 300,
        "additional_costs_factor": 1.3,
        "requests_per_server": 10_000_000,
    },
    "max_requests": 20_000_000,
}


def get_discounted_cost(api, total_tokens):
    cost = api["base_cost_per_token"]
    for threshold, multiplier in api["discounts"]:
        if total_tokens >= threshold:
            cost = api["base_cost_per_token"] * multiplier
        else:
            break
    return cost


def calculate_costs(
    requests_per_month, apis, api_conf, cloud, server, gpu, gpu_server
):
    tokens_per_request = api_conf["tokens_per_request"]
    api_costs = {}
    total_tokens = requests_per_month * tokens_per_request

    for api in apis:
        cost_per_token = np.array(
            [get_discounted_cost(api, t) for t in total_tokens]
        )
        api_costs[api["name"]] = total_tokens * cost_per_token

    cloud_costs = (
        np.ceil(requests_per_month / cloud["requests_per_instance"])
        * cloud["cost_per_instance"]
    )

    server_instances = np.ceil(
        requests_per_month / server["requests_per_server"]
    )
    server_costs = (
        server_instances
        * (server["cost_per_server"] + server["support_cost_per_server"])
        * server["additional_costs_factor"]
    )

    gpu_instances = np.ceil(requests_per_month / gpu["requests_per_instance"])
    gpu_costs = gpu_instances * gpu["cost_per_instance"]

    gpu_server_instances = np.ceil(
        requests_per_month / gpu_server["requests_per_server"]
    )
    gpu_server_costs = (
        gpu_server_instances
        * (
            gpu_server["cost_per_server"]
            + gpu_server["support_cost_per_server"]
        )
        * gpu_server["additional_costs_factor"]
    )

    return api_costs, cloud_costs, server_costs, gpu_costs, gpu_server_costs


def find_intersections(costs, requests_per_month, min_gap=5000):
    intersections = {}
    cost_keys = list(costs.keys())

    for i in range(len(cost_keys)):
        for j in range(i + 1, len(cost_keys)):
            diff = costs[cost_keys[i]] - costs[cost_keys[j]]
            indices = np.where(np.diff(np.sign(diff)))[0]

            if len(indices) > 0:
                filtered_indices = [indices[0]]
                for idx in indices[1:]:
                    if (
                        requests_per_month[idx]
                        - requests_per_month[filtered_indices[-1]]
                        > min_gap
                    ):
                        filtered_indices.append(idx)

                intersections[f"{cost_keys[i]} vs {cost_keys[j]}"] = (
                    requests_per_month[filtered_indices]
                )

    return intersections


def plot_costs(requests_per_month, costs, intersections):
    fig, ax = plt.subplots(figsize=(14, 8))
    colors = plt.cm.tab10.colors
    for i, (label, cost) in enumerate(costs.items()):
        ax.plot(
            requests_per_month,
            cost,
            label=label,
            color=colors[i % len(colors)],
            linewidth=2,
        )
    ax.set_xlabel("Количество запросов в месяц")
    ax.set_ylabel("Затраты ($)")
    ax.set_title("Сравнение затрат на вычислительные ресурсы")
    ax.legend(loc="upper left", bbox_to_anchor=(1, 1))
    ax.grid(True)

    plt.subplots_adjust(left=0.1, bottom=0.35, right=0.75, top=0.95)

    current_dir = Path.cwd()
    if current_dir.name != "research":
        img_path = current_dir / "research" / "research.png"
    else:
        img_path = Path("research.png")

    img_path.parent.mkdir(exist_ok=True, parents=True)
    plt.savefig(img_path, bbox_inches="tight", dpi=120)


def generate_markdown_report(intersections):
    current_dir = Path.cwd()
    if current_dir.name != "research":
        report_path = current_dir / "research" / "RESEARCH.MD"
    else:
        report_path = Path("RESEARCH.MD")

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# Исследование рентабельности решений\n\n")
        f.write("## Ключевые точки инверсии рентабельности\n\n")

        f.write("| Сравнение | Точка инверсии (запросов) |\n")
        f.write("|-----------|---------------------------|\n")

        for label, points in intersections.items():
            points_str = ", ".join(map(str, points))
            f.write(f"| {label} | {points_str} |\n")


def main():
    requests_per_month = np.arange(1, config["max_requests"] + 1, 1000)
    costs = {}

    api_costs, cloud_costs, server_costs, gpu_costs, gpu_server_costs = (
        calculate_costs(
            requests_per_month,
            config["apis"],
            config["api_config"],
            config["cloud"],
            config["server"],
            config["gpu"],
            config["gpu_server"],
        )
    )

    costs.update(api_costs)
    costs[config["cloud"]["name"]] = cloud_costs
    costs[config["server"]["name"]] = server_costs
    costs[config["gpu"]["name"]] = gpu_costs
    costs[config["gpu_server"]["name"]] = gpu_server_costs

    intersections = find_intersections(costs, requests_per_month)

    generate_markdown_report(intersections)
    plot_costs(requests_per_month, costs, intersections)


if __name__ == "__main__":
    main()
